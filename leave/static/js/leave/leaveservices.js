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

const postLeave = (data, callbacksuccess) => {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/leave/update',
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
        callbacksuccess()
    }
    ).catch(err => {
        if (err.name !== 'NonNetworkError') {
            console.log("A Network issue occured, Please Try Again Later! ")
        }
        console.error(err);
              
    })
}



const deleteLeave = (data, callbacksuccess) => {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/leave/undo',
        { headers: { 'X-CSRFToken': csrftoken } }
    );
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',  // Do not send CSRF token to another domain.
        body: JSON.stringify(data)
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
        callbacksuccess(res.result)
    }
    ).catch(err => {
        if (err.name !== 'NonNetworkError') {
            console.log("A Network issue occured, Please Try Again Later! ")
        }
        console.error(err);
                
    })
}