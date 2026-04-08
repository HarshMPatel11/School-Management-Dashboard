$base='http://localhost:5000'
$today=Get-Date -Format 'yyyy-MM-dd'
$results=@()
function Add-Result($step,$method,$path,$status,$ok,$data){
  $script:results += [pscustomobject]@{step=$step;method=$method;path=$path;status=$status;ok=$ok;data=$data}
}

try {
  $r=Invoke-WebRequest -Uri "$base/" -Method Get -UseBasicParsing -ErrorAction Stop
  $body=if($r.Content){ try{ $r.Content | ConvertFrom-Json } catch { $r.Content } } else { $null }
  Add-Result 1 'GET' '/' $r.StatusCode $true @{message=$body.message}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  Add-Result 1 'GET' '/' $code $false @{error=$_.Exception.Message}
}

try {
  $r=Invoke-WebRequest -Uri "$base/api/students" -Method Get -UseBasicParsing -ErrorAction Stop
  $arr=$r.Content | ConvertFrom-Json
  $count=if($arr -is [array]){$arr.Count}else{1}
  $firstId=if($count -gt 0){$arr[0]._id}else{$null}
  Add-Result 2 'GET' '/api/students' $r.StatusCode $true @{count=$count;firstId=$firstId}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  Add-Result 2 'GET' '/api/students' $code $false @{error=$_.Exception.Message}
}

$studentPayload=@{
  fullName='Aarav Sharma';rollNumber='R2026-001';className='10';section='A';gender='Male';
  parentName='Rakesh Sharma';contactNumber='9876543210';address='Delhi';email='aarav@example.com'
}
$studentId=$null
try {
  $r=Invoke-WebRequest -Uri "$base/api/students" -Method Post -Body ($studentPayload|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
  $obj=$r.Content | ConvertFrom-Json
  $studentId=$obj._id
  Add-Result 3 'POST' '/api/students' $r.StatusCode $true @{_id=$obj._id;rollNumber=$obj.rollNumber;retry=$false}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  $resp=''
  if($_.Exception.Response){$sr=New-Object IO.StreamReader($_.Exception.Response.GetResponseStream());$resp=$sr.ReadToEnd();$sr.Close()}
  if($resp -match 'duplicate' -or $resp -match 'roll' -or $_.Exception.Message -match 'duplicate'){
    try {
      $studentPayload.rollNumber='R2026-001B'
      $r=Invoke-WebRequest -Uri "$base/api/students" -Method Post -Body ($studentPayload|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
      $obj=$r.Content | ConvertFrom-Json
      $studentId=$obj._id
      Add-Result 3 'POST' '/api/students' $r.StatusCode $true @{_id=$obj._id;rollNumber=$obj.rollNumber;retry=$true}
    } catch {
      $code2=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
      Add-Result 3 'POST' '/api/students' $code2 $false @{error=$_.Exception.Message;retry=$true}
    }
  } else {
    Add-Result 3 'POST' '/api/students' $code $false @{error=$_.Exception.Message}
  }
}

if($studentId){
  try {
    $att=@{student=$studentId;date=$today;status='Present'}
    $r=Invoke-WebRequest -Uri "$base/api/attendance" -Method Post -Body ($att|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
    $obj=$r.Content|ConvertFrom-Json
    Add-Result 4 'POST' '/api/attendance' $r.StatusCode $true @{_id=$obj._id;student=$obj.student;status=$obj.status;date=$obj.date}
  } catch {
    $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
    Add-Result 4 'POST' '/api/attendance' $code $false @{error=$_.Exception.Message}
  }

  try {
    $fee=@{student=$studentId;month='April 2026';totalFee=5000;paidFee=3000}
    $r=Invoke-WebRequest -Uri "$base/api/fees" -Method Post -Body ($fee|ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
    $obj=$r.Content|ConvertFrom-Json
    Add-Result 5 'POST' '/api/fees' $r.StatusCode $true @{_id=$obj._id;paymentStatus=$obj.paymentStatus;dueFee=$obj.dueFee;paidFee=$obj.paidFee}
  } catch {
    $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
    Add-Result 5 'POST' '/api/fees' $code $false @{error=$_.Exception.Message}
  }
} else {
  Add-Result 4 'POST' '/api/attendance' -1 $false @{error='Skipped: no student id'}
  Add-Result 5 'POST' '/api/fees' -1 $false @{error='Skipped: no student id'}
}

try {
  $r=Invoke-WebRequest -Uri "$base/api/attendance?date=$today" -Method Get -UseBasicParsing -ErrorAction Stop
  $obj=$r.Content|ConvertFrom-Json
  $count=if($obj -is [array]){$obj.Count}else{1}
  $first=if($count -gt 0){$obj[0]}else{$null}
  Add-Result 6 'GET' '/api/attendance?date=today' $r.StatusCode $true @{count=$count;firstId=$first._id;firstStatus=$first.status;firstStudent=$first.student}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  Add-Result 6 'GET' '/api/attendance?date=today' $code $false @{error=$_.Exception.Message}
}

try {
  $r=Invoke-WebRequest -Uri "$base/api/fees" -Method Get -UseBasicParsing -ErrorAction Stop
  $obj=$r.Content|ConvertFrom-Json
  $count=if($obj -is [array]){$obj.Count}else{1}
  $first=if($count -gt 0){$obj[0]}else{$null}
  Add-Result 7 'GET' '/api/fees' $r.StatusCode $true @{count=$count;firstId=$first._id;paymentStatus=$first.paymentStatus;dueFee=$first.dueFee}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  Add-Result 7 'GET' '/api/fees' $code $false @{error=$_.Exception.Message}
}

try {
  $r=Invoke-WebRequest -Uri "$base/api/students/stats/summary" -Method Get -UseBasicParsing -ErrorAction Stop
  $obj=$r.Content|ConvertFrom-Json
  Add-Result 8 'GET' '/api/students/stats/summary' $r.StatusCode $true @{totalStudents=$obj.totalStudents;maleStudents=$obj.maleStudents;femaleStudents=$obj.femaleStudents}
} catch {
  $code=if($_.Exception.Response){[int]$_.Exception.Response.StatusCode}else{-1}
  Add-Result 8 'GET' '/api/students/stats/summary' $code $false @{error=$_.Exception.Message}
}

$results | ConvertTo-Json -Depth 6
