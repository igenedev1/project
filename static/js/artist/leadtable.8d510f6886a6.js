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
     "LEAVE":"Leave"       
}
var scrollLeft,scrollTop;

var editedcell; var leadTable;
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
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
 
   

    getDateFormat=(yourDate)=>{
        return `${yourDate.getFullYear()}-${("0" + (yourDate.getMonth()+1)).slice(-2)}-${("0" + yourDate.getDate()).slice(-2)}`
    }

    getMandaysFormat=(hour,min)=>{
        return (((parseInt(hour)*60)+parseInt(min))/(8*60)).toFixed(2);
    }

    setScrollFieldsAndData = (data) =>{
        scrollLeft=$('#project-table > div.tabulator-tableHolder')[0].scrollLeft;
        scrollTop=$('#project-table > div.tabulator-tableHolder')[0].scrollTop;
        leadTable.setData(data).then(()=>{
            $('#project-table > div.tabulator-tableHolder')[0].scrollLeft=scrollLeft;
            $('#project-table > div.tabulator-tableHolder')[0].scrollTop= scrollTop;

        })
    }
    actOnDailies=(event,cell)=>{
        dateField=cell.getField().split('.')[1];

        if (cell.getRow().getData().dates[dateField] === undefined) {
            return
        }
        dailies_id=cell.getRow().getData().dates[dateField].id
        if(event.target.name == "dailies_details"){
            getDailiesData(dailies_id,addDailyDetails)
        }
        if(event.target.name == "dailies_approve"){
            if(cell.getRow().getData().dates[dateField].approved){
                disapproveDailies({id:dailies_id},()=>{
                    getDUData(data => setScrollFieldsAndData(data));           
                },()=>{
                    getDUData(data => setScrollFieldsAndData(data));           
                    console.error('failed');
                });
            }else{
                approveDailies({id:dailies_id},()=>{
                    getDUData(data => setScrollFieldsAndData(data));         
                },()=>{
                    getDUData(data => setScrollFieldsAndData(data));           
                    console.error('failed');
                });
            }
        }
                
    }

    addDailyDetails=(data)=>{
        $('#intime_field').html(data.intime);
        $('#outtime_field').html(data.outtime);
        $('#total_hours_field').html(data.total_hours);
        $('#dailiesnotes').html(data.review_notes);
        $('#dailiesnotes_artist').html(data.artist_notes);
        data.dailies.map(work => {
            let cel1;
            if(work.slottype==="PROD_SHOT"||work.slottype==="TEST_SHOT"){
                cel1=$(`<td> <span>${slotdata[work.slottype]}</span> ${work.shot} ${work.percentage}%</td>`)[0];
            }else{
                cel1 = $(`<td>${slotdata[work.slottype]}</td>`)[0];
            }
            let ar=work.slottime.split(':');
            let cel2 = $(`<td> ${ar[0]} hh : ${ar[1]} mm</td>`)[0]
            let cel3 = $(`<td> ${getMandaysFormat(ar[0],ar[1])} md</td>`)[0]
            $('<tr />').append([cel1, cel2, cel3]).appendTo($('#dailies-modal').find('#worktable'));
        });
        $('<input>').attr({
            type: 'hidden',
            id: 'hiddendailyid',
            name: 'id',
            'data-approved':data.approved,
            value: data.id
        }).appendTo($('#dailies-modal #dailiesnotes_form'));
        if($('#hiddendailyid').data('approved')){
            $('#dailiesactnBtn').html('Disapprove');
        }else{
            $('#dailiesactnBtn').html('Approve');
        }
        $('#dailies-modal').modal('show');
    }

    $('#dailiesactnBtn').click(function (event){
        let data={};
        $('#dailiesnotes_form :input').each(function(){
            this.name=='review_notes'? data[this.name]=this.value.trim():data[this.name]=this.value
        })
        if($('#hiddendailyid').data('approved')){
            disapproveDailies(data,()=>{
                getDUData(data => setScrollFieldsAndData(data));           
                $('#dailies-modal').modal('hide');
            },()=>{
                getDUData(data => setScrollFieldsAndData(data));       
                console.error('failed');
                $('#dailies-modal').modal('hide');
            }); 
        }else{
            approveDailies(data,()=>{
                getDUData(data => setScrollFieldsAndData(data));           
                $('#dailies-modal').modal('hide');
            },()=>{
                getDUData(data => setScrollFieldsAndData(data));           
                console.error('failed');
                $('#dailies-modal').modal('hide');
            });
        }
    })

    $('#submitDailiesBtn').click(function (event){
        let data={};
        $('#dailiesnotes_form :input').each(function(){
            this.name=='review_notes'? data[this.name]=this.value.trim():data[this.name]=this.value
        }); 
        postDailiesnotes($('#hiddendailyid').val(),data,()=>{
            getDUData(data => setScrollFieldsAndData(data));           
            $('#dailies-modal').modal('hide');
        },()=>{
            getDUData(data => setScrollFieldsAndData(data));       
            console.error('failed');$('#dailies-modal').modal('hide');
        });       
    })
    $('#dailies-modal').on('shown.bs.modal', function (e) {
        $('#closeDailiesBtn').focus();
    })
    $('#dailies-modal').on('hidden.bs.modal', function (e) {
        $('#intime_field').html('');
        $('#outtime_field').html('');
        $('#total_hours_field').html('');
        $('#hiddendailyid').remove();
        $('#dailies-modal #worktable').html(''); 
        $('#dailiesactnBtn').html('');    

    })

    const getFieldArray=()=>{
        let nameCol={ title: "Artist Name", field: "username", width: 110,frozen:true };
        let deptCol={ title: "Department", field: "dept", width: 110,frozen:true };
        let today= new Date();
        let datesCol=[];
        [...Array(today.getDate()).keys()].map((num)=>{
            let day=num+1;
            let date=new Date(today.getFullYear(),today.getMonth(),day)           
            let datename=getDateFormat(date)
            let obj={
                        title: datename, field: `dates.${datename}`, width: 127, formatter: function (cell, formatterParams) {
                            var value = cell.getValue();
                            if(value==undefined) return "<span>N/A</span>";
                            let str=`<div >
                                        <div style="margin-right:0px;margin-left:0px" class="row mb-2 justify-content-between">
                                            ${(value.intime==null && value.outtime==null && (value.total_hours=="None" || value.total_hours==null))?
                                            `<span class="mr-2">A</span>
                                            <span>Nil</span>`
                                            :   
                                            `<span class="mr-2">P</span>
                                            <span>${value.total_hours}</span>
                                            `
                                            }

                                        </div>
                                        <div style="margin-right:0px;margin-left:0px" class="row">
                                            <button class="mr-2" name="dailies_details">details</button>
                                            ${(value.approved?'<button name="dailies_approve">Editable</button>':'<button name="dailies_approve">Approve</button>')}                                            
                                        </div>
                                    </div>`;
                
                            return str;
                        },
                        cellClick: actOnDailies
                        
                    }

            datesCol.push(obj)
          
        })
        console.log(datesCol);
        console.log([nameCol,deptCol,...datesCol]);
        return [nameCol,deptCol,...datesCol];

    }
  

    const drawtable = (data) => {
        leadTable = new Tabulator("#project-table", {          
  
            layout: "fitDataTable",           
            columns: getFieldArray()
        })
        leadTable.setData(data);
    }
    getDUData(drawtable);
    generateExcel=(data)=>{
        let arr1=[],arr2=[];
        data.map(({attendance,dailies_work})=>{
            arr1.push(attendance);arr2.push(dailies_work);
        })
        let today= new Date();
        let datesCol=[];
        let dateswidthCol=[];
        [...Array(today.getDate()).keys()].map((num)=>{
            let day=num+1;
            let date=new Date(today.getFullYear(),today.getMonth(),day);                       
            let datename=getDateFormat(date);
            datesCol.push(datename);
            dateswidthCol.push({wch:35})
        });
        var wb = XLSX.utils.book_new();
        wb.Props = {};
        wb.Props.Title = `Artist_date-${new Date().toLocaleString()}`;
        var ws1=XLSX.utils.json_to_sheet(arr1, {header:["artist_name","department",...datesCol]});
        var ws2=XLSX.utils.json_to_sheet(arr2, {header:["artist_name","department",...datesCol]});
        ws2['!cols'] = [{wch:15},{wch:10},...dateswidthCol];
        XLSX.utils.book_append_sheet(wb, ws1, "attendance");
        XLSX.utils.book_append_sheet(wb, ws2, "dailies");
        XLSX.writeFile(wb, `Artist_date-${new Date().toLocaleString()}.xlsx`);
    }
    $('#add-excel').click(function(event){
        getReportData(generateExcel);
    })


 


    var fieldEl = document.getElementById("filter-dept");
    var verEL = document.getElementById("filter-artist");
  
    function updateFilter(event){
        console.log(event.target.value);
        if(event.target.value==''||event.target.value==null||event.target.value == undefined) return;
        if(event.target.name == "username"){
            leadTable.setFilter(event.target.name,"like", event.target.value);
        }else{
            if(event.target.value!="Choose..."){
                leadTable.setFilter(event.target.name,"=", event.target.value);
            }
        }
        
    } 
    
    fieldEl.addEventListener("change",updateFilter);
    verEL.addEventListener("change",updateFilter);
    document.getElementById("clearfilter_btn").addEventListener("click", function(){
        fieldEl.value = "";       
        verEL.value = "";     
        leadTable.clearFilter();
    }); 
        
    var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();
    var $form = $('.box');
    if (isAdvancedUpload) {
        $form.addClass('has-advanced-upload');
        var droppedFile = false;

        $form.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        })
            .on('dragover dragenter', function () {
                $form.addClass('is-dragover');
            })
            .on('dragleave dragend drop', function () {
                $form.removeClass('is-dragover');
            })
            .on('drop', function (e) {
                droppedFile = e.originalEvent.dataTransfer.files[0];
                showFile(droppedFile);
            });

    }
    var $input = $form.find('input[type="file"]'),
        $label = $form.find('label'),
        showFile = function (file) {
            $label.text(file.name);
        };

    $input.on('change', function (e) {
        showFiles(e.target.files[0]);
    });
    $form.on('submit', function (e) {
        if ($form.hasClass('is-uploading')) return false;

        $form.addClass('is-uploading').removeClass('is-error');
        var ajaxData = new FormData($form.get(0));
        if (isAdvancedUpload) {
            ajaxData.set($input.attr('name'), droppedFile);
        } else {

        }
    });

}());
