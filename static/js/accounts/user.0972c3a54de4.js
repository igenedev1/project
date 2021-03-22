// //<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.0.13/css/all.css'></link>

// let tempdiv = '<td>' + obj.id + '</td><td><span class="agentName " id="agentId-' + obj.id + '">' + obj.name + '</span></td>';
// $("<tr />", { "class": "agentsListRow" }).append(tempdiv).appendTo('#agentTable');

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
handleError = (res) => {
    return new Promise((resolve, reject) =>
        res.json().then(data => {
            //  console.log(data.errors);
            toastr["error"](constructErrorMessage(data.errors));
            reject({ name: 'NonNetworkError', message: 'Invalid Data' });

        })
    )
}
function constructErrorMessage(err) {
    let str = ''
    for (var key in err) {
        console.log(err[key])
        err[key].map(msg => {
            // console.log(`${key}:${msg.message} (${msg.code})`);
            str = str.concat(`<div><strong>${key} :</strong><p>${msg.message} (${msg.code})</p></div>`);
        })

    }
    return str;
}

function editUser(data,callback) {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/accounts/edituser',
        { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',  // Do not send CSRF token to another domain.
        body: JSON.stringify(data)
    }).then(function (response) {
        if(!response.ok) throw new Error('Invalid Response')
        console.log('success');
        return response.json();
    }).then(res => callback(res))
    .catch(err=> {console.error('Error:', err);});
}

function postUser(data,callbacksuccess) {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/accounts/postuser',
        { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',  // Do not send CSRF token to another domain.
        body: data
    }).then(function (response) {
        const contentType = response.headers.get("content-type");
        console.log(contentType);
        if (!response.ok) {
            if (contentType && contentType.indexOf("application/json") === -1) {

                toastr["error"]("An Internal Server response issue occured.Please contact Support");
                throw { name: 'NonNetworkError', message: 'An Internal Server response issue occured.Please contact Support' };
            } else {
                return handleError(response)
            }

        }
        else return response.json();
    }).then(res => {
        callbacksuccess(res.result);
    }
    ).catch(err => {
        if (err.name !== 'NonNetworkError') {
            toastr["error"]("A Network issue occured, Please Try Again Later! ")
        }
        console.log(err);
         // errors = data.errors
    })

}

function deleteUser(data,callback) {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/accounts/deleteuser',
        { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',  // Do not send CSRF token to another domain.
        body: JSON.stringify(data)
    }).then(function (response) {
        if(!response.ok) throw new Error('Invalid Response')
        console.log('success');
        return response.json();
    }).then(res => callback(res))
    .catch(err=> {console.error('Error:', err);});
}
function getUsers(callback) {
      
    fetch('http://192.168.5.5:8008/accounts/userjson')
    .then(function (response) {
        if(!response.ok) throw new Error('Invalid Response')
        console.log('success');
        return response.json();
    }).then(res => callback(res))
    .catch(err=> {console.error('Error:', err);});
}
function renderUser(res){
    $('#userTable').empty();
    res.map(obj=>{
        let tempdiv = `<td>${obj.id}</td><td>${obj.igene_id}</td><td>${obj.email}</td><td>${obj.username}</td><td>${obj.dept?obj.dept:''}</td><td>${obj.designation?obj.designation:''}</td><td>${obj.doj?obj.doj:''}</td><td>${obj.usertype}</td><td><a href="#editEmployeeModal" class="edit" data-toggle="modal" data-target="#editEmployeeModal"><i class="fas fa-user-edit"></i></a>
        <a href="#deleteEmployeeModal" class="delete" data-toggle="modal" data-target="#deleteEmployeeModal"><i class="fas fa-user-minus"></i></a></td>`;
        
        $("<tr />", { "class": "usersListRow","id":obj.id,"data-userid":obj.id }).append(tempdiv).appendTo('#userTable');
    })
}
function getUser(user,callback){
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/accounts/getuser',
        { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request,{
        method: 'POST',
        mode: 'same-origin',  // Do not send CSRF token to another domain.
        body: JSON.stringify({'userid':user})
    }).then(response => {
        if(!response.ok) throw new Error('Invalid Input Response')
        return response.json();
    }).then( (res)=>{
        callback(res);
    }).catch(err=> {console.error('Error:', err);});
}

function getUserList(){
    fetch('http://192.168.5.5:8008/accounts/userjson').then(response => response.json()).then(function (res){
        console.log(res);
    });
}

$(document).ready(() => {
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
    getUsers(renderUser);
    $('#addUser').click(function () {
        let form_data = new FormData();
        let data = {};
        let passwords = $('#userdetails :input[type=password]');
        if ($(passwords[0]).val() !== $(passwords[1]).val()) {
            alert('password must be equal');
            return;
        }

        let text_inputs = $('#userdetails :input');
        text_inputs.each(function () {
            data[this.name] = $(this).val();
            form_data.append(this.name, $(this).val());
        });
        // let selec_inputs = $('#userdetails :select')
        // selec_inputs.each(function () {
        //     data[this.name] = $(this).val();
        // });
        console.log(data);
        let { password2, ...userdata } = data;
        postUser(form_data,(data)=>{
             renderUser(data);
             alert('Added User');
            //  $('#userdetails')[0].reset();
        });

    });
    $('#editEmployeeModal').on('show.bs.modal', function (event) {
        let row = $(event.relatedTarget).parent().parent();
         
        console.log(row.data('userid'));
        $('<input>').attr({
            type: 'hidden',
            id:'hiddenuseridedit',
            value:row.data('userid')
        }).appendTo('#editEmployeeModal .modal-body');
        
        getUser(row.data('userid'),(data)=>{
            let text_inputs = $('#edituserdetails :input[type]');
            text_inputs.each(function () {
                if (this.name in data) {
                    let foundData = data[this.name];
                    $(this).val(foundData);
                }
            });
            let select=$('#edituserdetails select')[0];
            if(select.name in data) {
                console.log(data[select.name]);
                $('#edituserdetails select option').each(function (){
                    if(this.text === data[select.name]){
                       
                        $(select).val($(this).attr('value'));
                    }
                }

                );
            }

        })
        // Button that triggered the modal
        // var recipient = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
       
      })
      $('#deleteEmployeeModal').on('show.bs.modal', function (event) {
        let row = $(event.relatedTarget).parent().parent();
         
        console.log(row.data('userid'));
        
        $('<input>').attr({
            type: 'hidden',
            id:'hiddenuserid',
            value:row.data('userid')
        }).appendTo('#deleteEmployeeModal .modal-body');
              
      })
      $('#deletebutton').on('click',function(event){
         let userId=$('#hiddenuserid').val();
         $('#hiddenuserid').remove();
         deleteUser({'userid':userId},renderUser)
         $('#deleteEmployeeModal').modal('hide')
         
      })
      $('#editUserbutton').on('click',function(event){
        let userId=$('#hiddenuseridedit').val();
        let data = {};
        data['userid']=userId;
        let text_inputs = $('#edituserdetails :input');
        text_inputs.each(function () {
            data[this.name] = $(this).val();
        });
        $('#hiddenuseridedit').remove();
        editUser(data,renderUser);
        $('#editEmployeeModal').modal('hide')

       //  deleteUser({'userid':userId})
        
     })
     $('#reset-form').on('click',function(event){
        $('#userdetails')[0].reset();
     })
      

});