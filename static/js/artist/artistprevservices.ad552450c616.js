const approveDailies= (data, callbacksuccess, callbackfail) => {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/artist/approvedailies',
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
        console.log(err);
        callbackfail();
        
    })

}

const disapproveDailies= (data, callbacksuccess, callbackfail) => {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        'http://192.168.5.5:8008/artist/rejectdailies',
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
        console.log(err);
        callbackfail();
        
    })

}


const postDailiesnotes= (id,data,callbacksuccess, callbackfail) => {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(  
        `http://192.168.5.5:8008/artist/dailies/${id}`,
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
        console.log(err);
        callbackfail();
        
    })

}

const getDUData= (callbacksuccess) => {
    fetch('http://192.168.5.5:8008/artist/dailiesjson')
    .then(function (response) {
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
        console.log(err);

    })
}

const getPrevDUData= (callbacksuccess) => {
    fetch('http://192.168.5.5:8008/artist/prevdailiesjson')
    .then(function (response) {
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
        console.log(err);

    })
}

const getDailiesData= (id,callbacksuccess) => {
    fetch(`http://192.168.5.5:8008/artist/dailies/${id}`)
    .then(function (response) {
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
        console.log(err);

    })
}



const getPrevReportData= (callbacksuccess) => {
    fetch('http://192.168.5.5:8008/artist/prevdailiesreportjson')
    .then(function (response) {
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
        console.log(err);

    })
}