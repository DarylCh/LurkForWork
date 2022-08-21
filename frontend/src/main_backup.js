import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

let postId = 0;
let token = -1;
let userId = -1;

// Main Feed Section
const getFeed = (token, start, userId) => {
    const homeSect = document.getElementById('main-feed-section');
    const banner = document.getElementById('banner-section');
    
    let params= {
        start : start,
    };
    
    const url = new URL("http://localhost:5005/job/feed");

    for (let k in params) {
        url.searchParams.append(k, params[k]);
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
        else {
            displayContent(homeSect);
            banner.style.display="flex";
            fillFeed(data, userId);
        }
    })
    .catch((error) => { console.log(error); })
};


function fillFeed(data, userId) {
    const mainFeed = document.getElementById('feed-container');
    mainFeed.innerHTML = "";
    data.forEach((post) => {
        makePost(post, mainFeed, userId);
    });
}

if (localStorage.getItem('token') !== undefined) {
    token = localStorage.getItem('token');
    userId = parseInt(localStorage.getItem('userId'));
    console.log(userId);
    getFeed(token, 0, userId);
};
// Store the token in local storage
// Done when you login. 

// Navigation Scripts
const registerLogin = document.getElementById('register-login');
registerLogin.addEventListener('click', (event) => {
    const loginSect = document.getElementById('login-section');
    displayContent(loginSect);
});

const loginRegister = document.getElementById('login-register');
loginRegister.addEventListener('click', (event) => {
    const registerSect = document.getElementById('register-section');
    displayContent(registerSect);
});

const displayContent = (selectedContent) => {
    const content = document.querySelectorAll('.section')
    content.forEach((cont) => {
        cont.style.display = "none";
    });
    selectedContent.style.display = "block";
}

// Account registration script
const registerForm = document.getElementById('register-form'); 
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const password2 = document.getElementById('reg-pass-conf').value;
    
    if (password !== password2) {
        alert('Passwords do not match');
    }

    const data = { "email": email, 
                   "password": password, 
                   "name": name };
    fetch('http://localhost:5005/auth/register', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
        else {
            getFeed(data.token, 0);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
        }
        
    })
    .catch((error) => {
    console.error('Error:', error);
    });
});

// Login Registration Script
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    
    if (email === '' || password === '') {
        if (email === '') {
            alert('Please fill in your email address');
        }
        else {
            alert('Please fill in your password');
        }
        return;
    }
    
    const data = { "email": email, "password": password };
    
    fetch('http://localhost:5005/auth/login', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
        else {
            token = data.token;
            getFeed(data.token, 0, data.userId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
        }
    })
    .catch((error) => { console.log(error); })
});

function makePost(data, feed) {
    const div = document.createElement('div');
    div.setAttribute("id", `feed-post-${postId}`);
    divStyle(div);
    // Post Title
    insertTitle(div, data.title);
    insertPostDate(div, data.createdAt);
    insertImage(div, data.image);
    insertStartDate(div, data.start);
    insertDesc(div, data.description);
    insertAuthor(div, data, feed, data.creatorId);
}

function divStyle(div) {
    div.style.backgroundColor="#ffffff";
    div.style.width="80vw";
    div.style.borderRadius="8px";
    div.style.margin="20px auto";
    div.style.padding="10px";
}

function insertTitle(div, text) {
    const title = document.createElement('h3');
    const titleText = document.createTextNode(text);
    title.appendChild(titleText);
    div.appendChild(title);
}

function insertPostDate(div, date) {
    var dateNow = new Date();
    var postDate = new Date(date);

    var diff = dateNow - postDate;
    
    let time = processDate(diff, postDate);
    const dateEle = document.createElement('p');
    const dateText = document.createTextNode(time);
    dateEle.appendChild(dateText);
    div.appendChild(dateEle);
}

function insertStartDate(div, date) {
    let string = 'Start Date: ' + date;
    let dateEle = document.createElement('p');
    let dateString = document.createTextNode(string);
    dateEle.appendChild(dateString);
    div.appendChild(dateEle);
}

function insertImage(div, image) {
    const imgEle = document.createElement('img');
    imgEle.src = image;
    imgEle.alt = "Post Image";
    div.appendChild(imgEle);
}

function insertAuthor(div, data, feed, uId) {
    var params= {
        userId : uId,
    };
    
    var url= new URL("http://localhost:5005/user");
    for (let k in params) {
        url.searchParams.append(k, params[k]);
    }
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    })
    .then(response => response.json())
    .then(json => {
        if (typeof json.error !== 'undefined') {
            alert(json.error);
        }
        else {
            let string = 'Post by: '+ json.name;
            const author = document.createElement('p');
            const authText = document.createTextNode(string);
            div.appendChild(authText);
            
            if (feed !== 'none') {
                const line = document.createElement('hr');
                div.appendChild(line);
                
                insertLikes(div, data.likes);
                insertComments(div, data.comments, data);
                
                insertActionBar(div, data, userId);
                const postSubmit = document.createElement('textarea');
                postSubmit.classList.add('form-control');

                feed.appendChild(div);
            }
            
            postId++;
        }
    })   
}

function insertActionBar(div, data, userId) {
    // Create action Bar
    const actionBar = document.createElement('div');
    actionBar.classList.add('action-bar');

    // Create Like Action Div 
    const likeItem = document.createElement('div');
    insertActionItem(actionBar, likeItem, 'Like');

    const commentItem = document.createElement('div');
    insertActionItem(actionBar, commentItem, 'Comment');
    div.appendChild(actionBar);

    likeItem.addEventListener('click', (event) => {
        addLike(data.likes, data.id, userId)
    });
}

function addLike(likesList, postId, uId) {
    let res = true;
    likesList.forEach((dict) => {
        if (dict.userId === uId) {
            res = false;
        } 
    });
    const data = {
        "id": postId,
        "turnon": res,
    }
    fetch('http://localhost:5005/job/like', {
        method: 'PUT', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token,
        },
       
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
    })
    .catch((error) => { console.log(error); })
}

function insertActionItem(actionBar, item, type) {
    item.classList.add('action-item');
    item.setAttribute('id', `action-${type}-${postId}`);
    const text = document.createTextNode(`${type}`);
    item.appendChild(text);
    actionBar.appendChild(item);
    
}

function processDate(ms, postDate) {
    var string = "Posted: ";
    // 1- Convert to seconds:
    let seconds = ms / 1000;
    // 2- Extract days:
    const days = parseInt( seconds / 86400 );
    seconds = seconds % 86400;
    const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
   
    if (days === 0) {
        string += hours + " hours " + minutes + " minutes ago";
    }
    else {
        let month = postDate.getMonth() + 1;
        string += postDate.getDate() + "/" + month + "/" + postDate.getFullYear(); 
    }
    return string;
}

function insertDesc(div, text) {
    const desc = document.createElement('p');
    const descText = document.createTextNode(text);
    desc.appendChild(descText);
    div.appendChild(desc);
}

// Duplicate code to fix later
function insertLikes(div, likesList) {
    let likeDiv = document.createElement('div');
    likeDiv.setAttribute('id', `feed-like-${postId}`);
    likeDiv.style.padding="0";
    likeDiv.style.height="30px";

    let count = 0;
    likesList.forEach((like) => {
        count += 1;
    })
    let countText = count.toString(10);
    let string = "Likes: " + countText;
    
    let likesString = document.createTextNode(string);
    let likeEle = document.createElement('p');
    likeEle.appendChild(likesString);
    likeDiv.appendChild(likeEle);
    
    div.appendChild(likeDiv);
    const likePanel = genLikes(div, likesList, likeDiv);
    
    likeDiv.addEventListener('click', (event) => {
        showPanel(likePanel);
    })
}

function genLikes(div, likesList) {
    let likePanel = document.createElement('div');
    genPanel(div, likePanel, likesList, 'like');
    return likePanel;
}

function genPanel(div, panel, list, type) {
    if (type === 'like') {
        panel.style.display="None";
    }
    list.forEach((item) => {
        const panelEle = document.createElement('div');
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(item.userName));
        panelEle.appendChild(p);
        
        if (type === 'comment') {
            const p2 = document.createElement('p');
            p2.appendChild(document.createTextNode(item.comment));
            panelEle.appendChild(p2);
        }
        panel.appendChild(panelEle);
        panelEle.style.lineHeight="5px";
        if (type === 'comment') {
            panelEle.style.backgroundColor="grey";
        }
        p.addEventListener('click', (event) => {
            showProfile(item.userId);
        });
    })
    div.appendChild(panel);
}

function showProfile(userId) {

    const params = {
        "userId": userId,
    }
    var url= new URL("http://localhost:5005/user");

    for (let k in params) {
        url.searchParams.append(k, params[k]);
    }
    
    // fetch(url, {
    //     method: 'GET', 
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json',
    //         'Authorization': token,
    //     },
    // })
    // .then(response => response.json())
    
    getReq(url).then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
        // Clear any existing jobs and followers
        const profileJobs = document.getElementById('profile-jobs-container');
        const profileFollowers = document.getElementById('profile-followers-container');
        profileJobs.innerHTML = "";
        profileFollowers.innerHTML = "";

        // const profName = document.getElementById('profile-name');
        // const profUID = document.getElementById('profile-uid');
        // const profEmail = document.getElementById('profile-email');
        // const profImage = document.getElementById('profile-image');
        // profName.textContent = "";
        // profUID.textContent = "";
        // profEmail.textContent = "";

        const profileSect = document.getElementById('profile-section');
        genProfile(data);
        displayContent(profileSect);
        console.log('success', data);
    })
    .catch((error) => { console.log(error); })
}

function getReq(url) {
    return fetch(url, {
        method: 'GET', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    })
    .then(response => response.json())
    // .catch((error) => { console.log(error); })
}

function genProfile(userData) {
    console.log(userData);
    const profName = document.getElementById('prof-main-name');
    const profUID = document.getElementById('prof-main-uid');
    const profEmail = document.getElementById('prof-main-email');
    const profImage = document.getElementById('prof-main-image');
    
    const editButton = document.getElementById('profile-edit-btn');
    if (userData.id === userId) {
        editButton.style.display="block";
    }
    else {
        editButton.style.display="none";
    }

    profName.textContent = userData.name;
    profUID.textContent = userData.id;
    profEmail.textContent = userData.email;
    profImage.setAttribute('src', userData.img);
    profImage.setAttribute('alt', ' Profile-Picture');
    
    genProfFollowers(userData.watcheeUserIds);
    genProfAllJobs(userData.jobs);

}

function genProfFollowers(list) {
    const div = document.getElementById('profile-followers-container');
    console.log(list);
    list.forEach((follower) => {
        const followerPanel = document.createElement('div');
        div.appendChild(followerPanel);
        
        var url= new URL("http://localhost:5005/user");
        const params = {
            "userId": follower,
        }
        
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        }
        
        getReq(url).then(data => {
            followerPanel.textContent = data.name;
        })
        .catch((error) => { console.log(error); })
        
    })
}

function genProfAllJobs(jobList) {
    console.log("here");
    console.log(jobList);
    const jobContainer = document.getElementById('profile-jobs-container');
    jobList.forEach((job) => {
        const jobDiv = document.createElement('div');
        genProfEachJob(jobDiv, job);
        jobDiv.style.backgroundColor="#f3f2ef";
        jobDiv.style.margin="20px 0";
        jobDiv.style.borderRadius="8px";
        jobContainer.appendChild(jobDiv);
    })
}

function genProfEachJob(div, data) {
    insertTitle(div, data.title);
    insertPostDate(div, data.createdAt);
    insertImage(div, data.image);
    insertStartDate(div, data.start);
    insertAuthor(div, data,'none', data.creatorId);
    insertDesc(div, data.description)
}

function showPanel(likePanel) {
    console.log(likePanel);
    if (likePanel.style.display === 'none') {
        likePanel.style.display = 'block';
    }
    else {
        likePanel.style.display = 'none';
    }
}

// Duplicate code to fix later
function insertComments(div, commentsList) {
    let cmntDiv = document.createElement('div');
    cmntDiv.setAttribute('id', `feed-comment-${postId}`);
    cmntDiv.style.padding="0";
    cmntDiv.style.height="30px";
    
    let count = 0;
    commentsList.forEach((like) => {
        count += 1;
    })
    let countText = count.toString(10);
    let string = "Comments: " + countText;
    let commentString = document.createTextNode(string);
    let commentEle = document.createElement('p');
    commentEle.appendChild(commentString);
    
    cmntDiv.appendChild(commentEle);
    div.appendChild(cmntDiv);

    const commentPanel = genComments(div, commentsList, cmntDiv);

    cmntDiv.addEventListener(('click'), event => {
        showPanel(commentPanel);
    });
}

function genComments(div, commentsList) {
    let commentPanel = document.createElement('div');
    genPanel(div, commentPanel, commentsList, 'comment');
    return commentPanel;
}


// Event Listener For Making Posts
const postForm = document.getElementById('post-form');
postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const postTitle = document.getElementById('post-title');
    const postDesc = document.getElementById('post-desc');
    const date = document.getElementById('post-date');
    const image = document.getElementById('post-img');
    const imageProcessed = fileToDataUrl(image);

    console.log(imageProcessed);
    console.log(date.value);
    var data = {
        title: postTitle.value,
        image: imageProcessed,
        start: date.value,
        description: postDesc.value,
    }
    fetch('http://localhost:5005/job', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
    })
    .catch((error) => { console.log(error); })
});

// Event Listener For Editing Profile 
const editForm = document.getElementById('profile-form');
editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const imageProcessed = fileToDataUrl(document.getElementById('profile-img').value);

    var data = {
        email: document.getElementById('profile-email').value,
        password: document.getElementById('profile-password').value,
        name: document.getElementById('profile-name').value,
        image: imageProcessed,
    }
    // image: document.getElementById('profile-img').value,
    fetch('http://localhost:5005/user', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            alert(data.error);
        }
    })
    .catch((error) => { console.log(error); })
})



// Banner Icons
const logoutBanner = document.getElementById('banner-logout');
logoutBanner.addEventListener('click', (event) => {
    token = -1;
    userId = -1;
    const banner = document.getElementById('banner-section');
    banner.style.display="None";
    const loginSect = document.getElementById('login-section');
    displayContent(loginSect);
});

const homeBanner = document.getElementById('banner-home');
homeBanner.addEventListener('click', (event) => {
    
    // const profileJobs = document.getElementById('profile-jobs-container');
    // profileJobs.innerHTML = "";

    const homeSect = document.getElementById('main-feed-section');
    displayContent(homeSect);
    getFeed(token, 0);
});

$('#profile-form').submit(function() {
    // Coding
    $('#profile-modal').modal('hide'); //or  $('#IDModal').modal('hide');
    return false;
});

$('#post-form').submit(function() {
    // Coding
    $('#post-modal').modal('hide'); //or  $('#IDModal').modal('hide');
    return false;
});
