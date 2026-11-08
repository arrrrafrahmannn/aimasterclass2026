// EKTU AI public form receiver. Never returns student records.
const TAB_NAME='Enrollments';
const HEADERS=['Reference','Submitted at (Dhaka)','Full name','WhatsApp number','bKash transaction ID','Amount (BDT)','Payment status','WhatsApp confirmation sent','Notes'];
function sheet_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw new Error('Run initializeSheet from the Apps Script project bound to your Sheet.');const book=SpreadsheetApp.openById(id);return book.getSheetByName(TAB_NAME)||book.insertSheet(TAB_NAME);}
function initializeSheet(){
  const active=SpreadsheetApp.getActiveSpreadsheet();if(active)PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID',active.getId());
  const sheet=sheet_();
  if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#111510').setFontColor('#e8d8b7');sheet.autoResizeColumns(1,HEADERS.length);}
  else if(sheet.getRange(1,1).getValue()!==HEADERS[0])throw new Error('The Enrollments tab already has different headers. Rename that tab before installing this version.');
  sheet.getRange('D:E').setNumberFormat('@');
  const statuses=SpreadsheetApp.newDataValidation().requireValueInList(['Pending','Verified','Rejected'],true).setAllowInvalid(false).build();
  sheet.getRange(2,7,Math.max(sheet.getMaxRows()-1,1),1).setDataValidation(statuses);
}
function doGet(){return json_({ok:true,service:'EKTU AI enrollment form',acceptingSubmissions:true});}
function doPost(e){
  const lock=LockService.getScriptLock();let locked=false;
  try{
    const raw=e&&e.postData&&e.postData.contents;
    if(!raw||raw.length>4096)return json_({ok:false,error:'Invalid submission.'});
    const d=JSON.parse(raw),name=String(d.name||'').trim(),tx=String(d.transactionId||'').trim().toUpperCase();
    let phone=String(d.whatsapp||'').replace(/[\s()-]/g,'');if(phone.startsWith('00880'))phone='+'+phone.slice(2);else if(phone.startsWith('880'))phone='+'+phone;else if(phone.startsWith('01'))phone='+88'+phone;
    if(d.website||d.consent!==true||name.length<2||name.length>100||/[\u0000-\u001f]/.test(name)||!/^\+8801[3-9]\d{8}$/.test(phone)||! /^[A-Z0-9]{10}$/.test(tx))return json_({ok:false,error:'Please check your name, WhatsApp number, and 10-character transaction ID.'});
    const elapsed=Date.now()-Number(d.startedAt);if(!Number.isFinite(elapsed)||elapsed<2000||elapsed>86400000)return json_({ok:false,error:'Please refresh the page and try again. Do not pay again.'});
    lock.waitLock(20000);locked=true;
    const sheet=sheet_(),last=sheet.getLastRow();if(!last||sheet.getRange(1,1).getValue()!==HEADERS[0])return json_({ok:false,error:'Enrollment is not configured yet. Please do not send a payment.'});
    const existing=last>1?sheet.getRange(2,1,last-1,HEADERS.length).getValues():[];
    for(let i=0;i<existing.length;i++){
      if(String(existing[i][4]).toUpperCase()===tx){
        if(String(existing[i][3]).replace(/^'/,'')===phone && String(existing[i][2]).replace(/^'/,'')===name)return json_({ok:true,reference:String(existing[i][0]),status:'Pending',alreadySubmitted:true});
        return json_({ok:false,error:'This transaction ID has already been submitted. Keep the ID and wait for the WhatsApp confirmation. Do not pay again.'});
      }
    }
    const cache=CacheService.getScriptCache(),rateKey='submit:'+phone,attempts=Number(cache.get(rateKey)||0);if(attempts>=5)return json_({ok:false,error:'Too many submissions for this number. Please try again in 15 minutes.'});cache.put(rateKey,String(attempts+1),900);
    const reference=Utilities.getUuid().replace(/-/g,'').slice(0,8).toUpperCase();
    sheet.appendRow([reference,Utilities.formatDate(new Date(),'Asia/Dhaka','yyyy-MM-dd HH:mm:ss'),safe_(name),safe_(phone),tx,299,'Pending','No','']);
    SpreadsheetApp.flush();return json_({ok:true,reference:reference,status:'Pending'});
  }catch(error){return json_({ok:false,error:'We could not confirm your submission. Keep your transaction ID and try again. Do not send another payment.'});}
  finally{if(locked)lock.releaseLock();}
}
function safe_(v){const s=String(v);return /^[=+@\-\t\r]/.test(s)?"'"+s:s;}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
