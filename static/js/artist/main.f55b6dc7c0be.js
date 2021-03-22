var slotdata={
   "PROD_SHOT":"Production Shot",
    "TEST_SHOT":"Test Shot",
    "TRAIN":"Training",
    "I/O":"I/O Downtime",
    "MEET":"Meeting",
    "SYS":"System Failure",
    "NET":"Network Issue",                
    "PERM":"Permission",
    "H_LEAVE":"Leave(Half Day)",
    "RENDER":"Render Time",       
}
clearArtsistCardData=(element)=>{
    $(element).find('#daytime :input[type=time]').each(function(){
        $(this).val('');
    }
    );        
    $(element).find('.notes-area > .dailiesnotes_artist').val();        
    $(element).find('.worktable').empty();
}

clearArtistData=()=>{
    [...document.querySelectorAll('.dailycontainer')].map((element)=>{
        clearArtsistCardData(element);
    })
}

appendArtistData=(data)=>{
    [...document.querySelectorAll('.dailycontainer')].map((element)=>{
        let date=$(element).find(".dateHolder").data('date');
        let obj=data.find(element => element.date === date)
        if(obj===undefined){
             return;
        }
        if(obj.approved && obj.approved!=null && obj.approved!="null" && obj.approved!=undefined){
            appendValidatedData(element,obj);
            $(element).find('.postbutton').prop('disabled',true);
        }else{
            appendInvalidatedData(element,obj);
        }

    });

}
appendInvalidatedData=(element,obj)=>{
    let isLeave=false;
    $(element).find('.daytime :input[type=time]').each(function(){
        $(this).val(obj[this.name]);
    }
    );
    if(obj.review_notes && obj.review_notes!="null"){
        $(element).find('.notes-area > .dailiesnotes').val(obj.review_notes);
        $(element).find('.notes-area').removeClass("no-display");
    }
    if(obj.artist_notes && obj.artist_notes!="null"){
        $(element).find('.notes-area > .dailiesnotes_artist').val(obj.artist_notes);
    }
    obj.dailies.map((work)=>{
        if(work.slottype==="LEAVE"){
            $(element).find('.leavecheck').prop('checked', true);
            $(element).find('.daytime :input[type=time]').attr('disabled', 'disabled');
            $(element).find('.daytime :input[type=time]').val('');
            $(element).find('.leavegroup').addClass("leaveday");
            $(element).find('.addWork').prop('disabled', true);
            $(element).find('.dailiesnotes_artist').prop('disabled', true);
            isLeave=true;            
            return;
        }
        let cel1 = $(`<td>
        <div class="workrow row">
        <select name="slottype" class="selectbox" class="pr-1">
        <option value="" selected>Choose</option>
        <option value="PROD_SHOT">Production Shot</option>
        <option value="TEST_SHOT">Test Shot</option>
        <option value="TRAIN">Training</option>
        <option value="I/O">I/O Downtime</option>
        <option value="MEET">Meeting</option>
        <option value="SYS">System Failure</option>
        <option value="NET">Network Issue</option>                
        <option value="PERM">Permission</option>
        <option value="H_LEAVE">Leave(Half Day)</option>
        <option value="RENDER">Render Time</option>                
        </select>
        </div>
        </td>`)[0];
        let cel2 = $('<td />').append(
            `           
            <div class="dugroup input-group">
            <div class="input-group-prepend">
            <span class="input-group-text nopad">Duration</span>
            </div>
            <div class="col nopad">
            <input class='h' name='h' type='number' min='0' max='23'/>
            <label class="font-12" for='h'>h</label>
            <input class='m' name='m' type='number' min='0' max='59'/>
            <label  class="font-12" for='m'>m</label>
            <div>
            </div>                  
            `
        )[0];
        let cel3 = $('<a />', { 'href': '#' }).append('<i class="fas fa-trash" style="color:red"></i>')[0];
        $('<tr />').append([cel1, cel2, $('<td />').append(cel3)[0]]).appendTo($(element).find('.worktable'));

        $($(cel1).find('.selectbox')[0]).children().each(function(){
            if(this.value===work.slottype) $(cel1).find('.selectbox').val(this.value);
        })
        let ar=work.slottime.split(':');
        $(cel2).find('.h').val(ar[0]);
        $(cel2).find('.m').val(ar[1]);

        $(cel1).find('.selectbox')[0].addEventListener("change", appendShotNode);
        $(cel2).find('.h')[0].addEventListener("change",onHoursChanged);
        $(cel2).find('.m')[0].addEventListener("change",onHoursChanged);
        cel3.addEventListener("click", deleteWorkRow);
        if(work.slottype==="PROD_SHOT"||work.slottype==="TEST_SHOT"){
            let ele = $(`<input type="text" name="shot" class="shotid" class="pr-1">                    
            </input>`)[0]
            let per = $(`<input name="percentage"  class="per" type='text' /><span class="per-symbol">%</span>`)

            $(cel1).find('.workrow').append(ele, per);
            $(cel1).find('.shotid').val(work.shot);
            $(cel1).find('.per').val(work.percentage);
        }

    })
    let tot_arr='';
    (!isLeave && obj.total_hours!=null) ?(  tot_arr=obj.total_hours.split(':'),
            $(element).find('.total-hours').val(`${tot_arr[0]}:${tot_arr[1]}`)):($(element).find('.total-hours').val(''));
}
appendValidatedData=(element,obj)=>{
    let isLeave=false;

    $(element).find('.leavecheck').prop('disabled', true); 
    $(element).find('.addWork').prop('disabled', true); 
    if(obj.review_notes && obj.review_notes!="null"){
        $(element).find('.notes-area > .dailiesnotes').val(obj.review_notes);
        $(element).find('.notes-area').removeClass("no-display");
    }
    if(obj.artist_notes && obj.artist_notes!="null"){
        $(element).find('.notes-area > .dailiesnotes_artist').val(obj.artist_notes);
        $(element).find('.dailiesnotes_artist').prop('disabled', true);
    }

    obj.dailies.map((work)=>{
        if(work.slottype=="LEAVE"){
            $(element).find('.leavecheck').prop('checked', true);
            $(element).find('.leavecheck').prop('disabled', true);
            $(element).find('.daytime :input[type=time]').attr('disabled', 'disabled');
            $(element).find('.daytime :input[type=time]').val('');
            $(element).find('.leavegroup').addClass("leaveday");
            $(element).find('.addWork').prop('disabled', true);
            $(element).find('.dailiesnotes_artist').prop('disabled', true);  
            isLeave=true;                    
            return;
        }
        let cel1;
        if(work.slottype==="PROD_SHOT"||work.slottype==="TEST_SHOT"){
            cel1=$(`<td> <span>${slotdata[work.slottype]}</span> ${work.shot} ${work.percentage}%</td>`)[0];
        }else{
            cel1 = $(`<td>${slotdata[work.slottype]}</td>`)[0];
        }
        let ar=work.slottime.split(':');
        let cel2 = $(`<td> ${ar[0]} Hr : ${ar[1]} mm</td>`)[0]
        $('<tr />').append([cel1, cel2]).appendTo($(element).find('.worktable'));
    })
    $(element).find('.daytime :input[type=time]').each(function(){
        $(this).val(obj[this.name]);
        $(this).attr('disabled', 'disabled');
    }
    );
    let tot_arr='';
    (!isLeave && obj.total_hours!=null)?(  tot_arr=obj.total_hours.split(':'),
            $(element).find('.total-hours').val(`${tot_arr[0]}:${tot_arr[1]}`)):($(element).find('.total-hours').val(''));
    
}
validateData=(data)=>{
    if(!(data.intime)){
        alert("please enter proper in time.")
        return false;
    }
    return true;
}
retotalHours=(container)=>{
    let hours=0,min=0,temp=0;
    $(container).find(".h").each(function(){
        hours+=parseInt(!(this.value==""||this.value==undefined)?this.value:0);
    })
    $(container).find(".m").each(function(){
        min+=parseInt(!(this.value==""||this.value==undefined)?this.value:0);
    })
    if(min>59){
        temp=Math.floor(min / 60);min=min%60;hours=hours+temp;
    }
    min=("0" + min).slice(-2);hours=("0" + hours).slice(-2);

    $(container).find('.total-hours').val(`${hours}:${min}`)
}
deleteWorkRow = (event) => {
    event.stopPropagation();
    event.preventDefault();
    let container=$(event.target).closest(".list-group-item")[0]
    event.target.removeEventListener("click", deleteWorkRow);
    $(event.target).parent().parent().parent().remove();    
    retotalHours(container);
}
appendShotNode = (event) => {
    event.stopPropagation();
    $(event.target).parent().find('.shotid').remove();
    $(event.target).parent().find('.per').remove();
    $(event.target).parent().find('.per-symbol').remove();   
    if ($(event.target).val() === "PROD_SHOT" || $(event.target).val() === "TEST_SHOT") {
        $(event.target).append
        let ele = $(`<input type="text" name="shot" class="shotid" class="pr-1">                    
                    </input>`)[0]
        let per = $(`<input name="percentage" class="per" type='text' /><span  class="per-symbol">%</span >`)

      
        $(event.target).parent().append(ele, per);
    }

}
onleaveChecked = (event)=>{
    let container=$(event.target).parent().parent().parent().parent();
    if(event.target.checked){
        $(container).find('.daytime :input[type=time]').attr('disabled', 'disabled');
        $(container).find('.daytime :input[type=time]').val('');
        $(container).find('.worktable').html('');
        $(container).find('.addWork').prop('disabled', true);
        $(container).find('.leavegroup').addClass("leaveday");
        $(container).find('.dailiesnotes_artist').prop('disabled', true);
        $(container).find('.dailiesnotes_artist').val('');        
    }else{
        $(container).find('.daytime :input[type=time]').removeAttr('disabled');
        $(container).find('.addWork').prop('disabled', false);
        $(container).find('.leavegroup').removeClass("leaveday"); 
        $(container).find('.dailiesnotes_artist').prop('disabled', true);
        $(container).find('.dailiesnotes_artist').val('');
    }
}
onHoursChanged = (event)=>{
    let container=$(event.target).closest(".list-group-item")[0];
    let val=$(container).find('.total-hours').val();
    let temp=0;
    let hours=0;
    $(container).find(".h").each(function(){
        hours+=parseInt(!(this.value==""||this.value==undefined)?this.value:0);
    })
    let min=0;
    $(container).find(".m").each(function(){
        min+=parseInt(!(this.value==""||this.value==undefined)?this.value:0);
    })
    if(min>59){
        temp=Math.floor(min / 60);min=min%60;hours=parseInt(hours)+temp;
    }
    hours=("0" + hours).slice(-2);min=("0" + min).slice(-2);        
    $(container).find('.total-hours').val(`${hours}:${min?min:00}`)  
   
}

postwork = (event) => {
    let container = $(event.target).parent().parent()[0];
    let leave = $(container).find('.leavegroup :input[type=checkbox]')[0]
    let data = {};
    if (leave.checked) {
        data = {
            
            date: $(container).find('.dateHolder').data('date'),
            dailies: [
                {
                    slottype: 'LEAVE',
                    slottime: '08:00:00'
                }
            ]
        }
        return  postArtistdata(data,()=>{
                        toastr["success"]("Data was posted successfully.")
                        clearArtistData();
                        getArtistData(appendArtistData);
                    },()=>{
                        clearArtistData();
                        getArtistData(appendArtistData);
                    }
                )
    }
    $(container).find('.daytime :input[type=time]').each(function () {
        console.log(this);
        if(this.value!=null && this.value!=undefined && this.value!=""){
            data[this.name] = $(this).val();

        }        
    }
    )
    $(container).find('.dailiesnotes_artist').each(function () {       
        data[this.name] =this.value.trim();        
    }
    )
    data['date']=$(container).find('.dateHolder').data('date')
    data['dailies'] = []
    $(container).find('.worktable tr').each(function () {
        let dailyinp = {}
        $(this).find(':input').each(function () {
            dailyinp[this.name] = $(this).val();
        })
        let { h, m, ...daily } = dailyinp;
        console.log(m);
        daily['slottime'] = `${(h!=null && h!=undefined && h!=00 && h!=0 && h!="")?h:00}:${(m!=null && m!=undefined && m!=00 && m!=0 && m!="")?m:00}:00`;
        console.log(daily);
        data.dailies.push(daily);
    }
    )
    // data['total_hours']=$(container).find('.total-hours')[0].value;
    if(!validateData(data)) return;
    postArtistdata(data,()=>{
        toastr["success"]("Data was posted successfully.")
        clearArtistData();
        getArtistData(appendArtistData);
    },()=>{
        clearArtistData();
        getArtistData(appendArtistData);
    }
    )
}

addworkcolumn = (event) => {
    event.stopPropagation();
    let cel1 = $(`<td>
                <div class="workrow row">
                <select name="slottype" class="selectbox" class="pr-1">
                <option value="" selected>Choose</option>
                <option value="PROD_SHOT">Production Shot</option>
                <option value="TEST_SHOT">Test Shot</option>
                <option value="TRAIN">Training</option>
                <option value="I/O">I/O Downtime</option>
                <option value="MEET">Meeting</option>
                <option value="SYS">System Failure</option>
                <option value="NET">Network Issue</option>                
                <option value="PERM">Permission</option>
                <option value="H_LEAVE">Leave(Half Day)</option>
                <option value="RENDER">Render Time</option>                
                </select>
                </div>
                </td>`)[0];
    let cel2 = $('<td />').append(        `           
                    <div class="dugroup input-group">
                    <div class="input-group-prepend">
                    <span class="input-group-text nopad" id="">Duration</span>
                    </div>
                    <div class="col nopad">
                    <input class='h' name='h' type='number' min='0' max='24'/>
                    <label class="font-12" for='h'>h</label>
                    <input class='m' name='m' type='number' min='0' max='59'/>
                    <label class="font-12" for='m'>m</label>
                    <div>
                    </div>                  
                    `
    )[0];
    let cel3 = $('<a />', { 'href': '#' }).append('<i class="fas fa-trash" style="color:red"></i>')[0];
    console.log($(cel1).find('.selectbox'));
    $(cel1).find('.selectbox')[0].addEventListener("change", appendShotNode);
    $(cel2).find('.h')[0].addEventListener("change",onHoursChanged);
    $(cel2).find('.m')[0].addEventListener("change",onHoursChanged);

    cel3.addEventListener("click", deleteWorkRow);

    console.log($(event.target).next('.tablework').children('.worktable'));
    $('<tr />').append([cel1, cel2, $('<td />').append(cel3)[0]]).appendTo($(event.target).parent().parent().parent().next('.list-group-item').children('.tablework').children('.worktable'));


}





(function () {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "20000",
        "extendedTimeOut": "20000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    $('.addWork').click(addworkcolumn);
    $('.postbutton').click(postwork);
    $('.leavecheck').change(onleaveChecked);
    getArtistData(appendArtistData);

}());
