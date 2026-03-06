export function getInstitutes(){
    // const accessToken = localStorage.getItem('my_token');
    // console.log("accessToken",accessToken);
    return fetch('http://localhost:8000/institutes/institute/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${accessToken}`,
        },
    })
    // .then(res => res.json()
    .then(res => res.json().then(data=>({
        status: res.status,
        body: data,
    })))
    // .then(data =>console.log("data",data));
}

export function addInstitute(name){
    return fetch('http://localhost:8000/institutes/institute/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
        })
    })
    .then(res => res.json())
    // .then(data =>console.log("data",data));
}

export async function getVarifiedInstitutes(instituteName,adminId){
    const data={
        name: instituteName,
        admin_key: adminId
    }
    return await fetch('http://localhost:8000/institutes/verify/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
.then(res => res.json().then(data=>({
    status: res.status,
    body: data,
})))

}