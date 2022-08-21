import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

const backendURL = `http://localhost:${BACKEND_PORT}`;
let postId = 0;
let token;
let userId = -1;
let start = 0;
let pageLim = 0;
const postPerPage = 5;
let currPost = 0;

// Main Feed Section

// Makes a fetch request for the feed data then 
// calls fillFeed to fill the feed with this 
// data
const getFeed = (token, startParam) => {
    const homeSect = document.getElementById('main-feed-section');
    const banner = document.getElementById('banner-section');
    let params= {
        start : startParam,
    };
    
    const url = new URL(`${backendURL}/job/feed`);

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
            showPopup(data.error);
        }
        else {
            if (start === 0) {
                const mainFeed = document.getElementById('feed-container');
                mainFeed.innerHTML = "";
            }
            displayContent(homeSect);
            banner.style.display="flex";
            fillFeed(data);
        }
    })
    .catch((error) => { console.log(error); })
};


// Fills the feed container with the posts from
// getFeed
function fillFeed(data) {
    const mainFeed = document.getElementById('feed-container');
    data.forEach((post) => {
        makePost(post, mainFeed);
    });
}

// Infinite scroll event listener
window.addEventListener('scroll',()=>{
    const mainFeed = document.getElementById('main-feed-section');
    if (mainFeed.style.display !== 'none') {
        if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight){
            start += 5;
            getFeed(token, start);
        }
    }
})

// Checks to see if a user is already logged in upon refreshing
if (localStorage.getItem('token') !== undefined && localStorage.getItem('token') !== null) {
    token = localStorage.getItem('token');
    userId = parseInt(localStorage.getItem('userId'));
    start = 0;
    getFeed(token, start, userId);
};

// Login and Register Sections
// Navigation Script thtat navigates to the login section
const registerLogin = document.getElementById('register-login');
registerLogin.addEventListener('click', (event) => {
    const loginSect = document.getElementById('login-section');
    displayContent(loginSect);
});

// Navigation script that navigates to the register section
const loginRegister = document.getElementById('login-register');
loginRegister.addEventListener('click', (event) => {
    const registerSect = document.getElementById('register-section');
    displayContent(registerSect);
});

// Function that displays the section passed to it, hiding
// all of the others
const displayContent = (selectedContent) => {
    const content = document.querySelectorAll('.section')
    content.forEach((cont) => {
        cont.style.display = "none";
    });
    selectedContent.style.display = "block";
}

// Account registration script
// This function registers the user with the system or
// throws error messages if there was a problem with registration
const registerForm = document.getElementById('register-form'); 
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    const password2 = document.getElementById('reg-pass-conf').value;
    
    if (password !== password2) {
        showPopup("Error: Passwords do not match.");
        return;
    }

    const data = { "email": email, 
                   "password": password, 
                   "name": name };

    fetch(`${backendURL}/auth/register`, {
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
            showPopup(data.error);
        }
        else {
            start = 0;
            getFeed(data.token, start, data.userId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
        }
        
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Login Registration Script
// This function logs the user in to the system
// if they have entered all the right details.
// Throws the appropriate error message otherwise.
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    
    if (email === '' || password === '') {
        if (email === '') {
            showPopup('Please fill in your email address');
        }
        else {
            showPopup('Please fill in your password');
        }
        return;
    }
    
    const data = { "email": email, "password": password };
    
    fetch(`${backendURL}/auth/login`, {
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
            showPopup(data.error);
        }
        else {
            token = data.token;
            userId = data.userId;
            start = 0;
            getFeed(data.token, start, data.userId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
        }
    })
    .catch((error) => { console.log(error); })
});

function makePost(data, feed) {
    const div = document.createElement('div');
    divStyle(div);
   
    // Post Title
    insertTitle(div, data.title);
    insertPostDate(div, data.createdAt);
    insertImage(div, data.image);
    insertStartDate(div, data.start);
    insertDesc(div, data.description);
    insertAuthor(div, data, feed, data.creatorId, 'main');
}

// This function styles the div for each post node
function divStyle(div) {
    div.style.backgroundColor="#ffffff";
    div.style.width="80vw";
    div.style.borderRadius="8px";
    div.style.margin="20px auto";
    div.style.padding="10px";
}

// This function inserts the title to a post node
function insertTitle(div, text) {
    const title = document.createElement('h3');
    const titleText = document.createTextNode(text);
    title.appendChild(titleText);
    div.appendChild(title);
}

// This function inserts the post date to the post node
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

// This function converts the miliseconds for the date
// into actual date fields.
function processDate(ms, postDate) {
    var string = "Posted: ";
    // Convert to seconds:
    let seconds = ms / 1000;
    // Extract days:
    const days = parseInt( seconds / 86400 );
    seconds = seconds % 86400;
    const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // Extract minutes:
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


// This function inserts the start date to the post node
function insertStartDate(div, date) {
    let splitDate = date.split("T");
    let string = 'Start Date: ' + splitDate[0] + ' ' + splitDate[1];
    let dateEle = document.createElement('p');
    let dateString = document.createTextNode(string);
    dateEle.appendChild(dateString);
    div.appendChild(dateEle);
}

// This function inserts an image to the post node
function insertImage(div, image) {
    const imgEle = document.createElement('img');
    imgEle.src = image;
    imgEle.alt = "Post Image";
    imgEle.classList.add('image-class');
    div.appendChild(imgEle);
}

// This function inserts an author to the post node
// and calls the other post-filling functions
// after the async operation is finished
function insertAuthor(div, data, feed, uId, type) {
    feed.appendChild(div);
    
    var params= {
        userId : uId,
    };
    var url= new URL(`${backendURL}/user`);
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
            showPopup(json.error);
        }
        else {
            let string = 'Post by: '+ json.name;
            const author = document.createElement('p');
            const authText = document.createTextNode(string);
            div.appendChild(authText);
            
            // Only inserts these elements for main feed posts
            if (type === 'main') {
                const line = document.createElement('hr');
                div.appendChild(line);
                
                insertLikes(div, data.likes);
                const commentItem = insertActionBar(div, data, userId);
                insertComments(div, data.comments, data);
                insertCommentBar(div, data.id, commentItem);

                const postSubmit = document.createElement('textarea');
                postSubmit.classList.add('form-control');
            }
            
            if (data.creatorId === userId) {
                insertEditDel(div, data);
            }
            postId++;
        }
    })   
}

// This function implements the like/comment action bar
// It returns the comment item to be used later
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
    
    return commentItem
}

// This function adds a like to the given post
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
    fetch(`${backendURL}/job/like`, {
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
            showPopup(data.error);
        }
    })
    .catch((error) => { console.log(error); })
}

// This function adds the like/comment action bar
// to the main feed posts
function insertActionItem(actionBar, item, type) {
    item.classList.add('clickable-action')
    item.classList.add('action-item');
    item.setAttribute('id', `action-${type}-${postId}`);
    const text = document.createTextNode(`${type}`);
    item.appendChild(text);
    actionBar.appendChild(item);
}

// This function creates and inserts the description text 
// of a job post
function insertDesc(div, text) {
    const desc = document.createElement('p');
    const descText = document.createTextNode(text);
    desc.appendChild(descText);
    div.appendChild(desc);
}

// This function implements the like counter
// and executes the genLikes function to 
// generate the list of likes
function insertLikes(div, likesList) {
    let likeDiv = document.createElement('div');
    likeDiv.classList.add('clickable');

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

// This function generates the list of likes and 
// returns it to insertLikes
function genLikes(div, likesList) {
    let likePanel = document.createElement('div');
    genPanel(div, likePanel, likesList, 'like');
    return likePanel;
}

// This function inserts the 'panels' for the 
// list of likes and the list of comments and
// inserts them into the appropriate section
function genPanel(div, panel, list, type) {
    if (type === 'like') {
        panel.style.display="None";
    }
    list.forEach((item) => {
        const panelEle = document.createElement('div');
        const panelText = document.createElement('div');
        const p = document.createElement('p');
        p.classList.add('clickable');
        p.appendChild(document.createTextNode(item.userName));
        panelText.appendChild(p);
        
        if (type === 'comment') {
            const p2 = document.createElement('p');
            p2.appendChild(document.createTextNode(item.comment));
            panelText.appendChild(p2);
        }
        
        panelEle.appendChild(panelText);
        panelEle.style.borderRadius="5px";

        panelEle.style.lineHeight="1rem";
        panel.appendChild(panelEle);
        if (type === 'comment') {
            panelEle.style.backgroundColor="#f3f2ef";
        }
        p.addEventListener('click', (event) => {
            showProfile(item.userId);
        });
    })
    div.appendChild(panel);
}

// This function instigates the 'profile' section
// and calls the genProfile function to generate
// the profile details. 
function showProfile(uId) {

    const params = {
        "userId": uId,
    }
    var url= new URL(`${backendURL}/user`);

    for (let k in params) {
        url.searchParams.append(k, params[k]);
    }

    getReq(url).then(data => {
        if (typeof data.error !== 'undefined') {
            showPopup(data.error);
        }
        // Clear any existing jobs and followers
        const profileJobs = document.getElementById('profile-jobs-container');
        const profileFollowers = document.getElementById('profile-followers-container');
        profileJobs.innerHTML = "";
        profileFollowers.innerHTML = "";

        const profileSect = document.getElementById('profile-section');
        genProfile(data);
        displayContent(profileSect);
    })
    .catch((error) => { console.log(error); })
}

// This function calls the get fetch request from the API
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
}

// This function watches or unwatches a certain
// user given their email
function watchFetch(email, turnon) {
    let data = {
        email: email,
        turnon: turnon,
    }
    fetch(`${backendURL}/user/watch`, {
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
            showPopup(data.error);
        }
    })
}

// This function generates the profile page for a particular
// user. It calls the genProfFollowers and genProfAllJobs
// to get the followers of the user and their posted jobs
function genProfile(userData) {
    const profName = document.getElementById('prof-main-name');
    const profUID = document.getElementById('prof-main-uid');
    const profEmail = document.getElementById('prof-main-email');
    const profImage = document.getElementById('prof-main-image');
    
    const editButton = document.getElementById('profile-edit-btn');
    const unwatchButton = document.getElementById('profile-unwatch-btn');
    const watchButton = document.getElementById('profile-watch-btn');
    
    
    watchButton.addEventListener('click', (event) => {
        watchFetch(userData.email, true);
    })
    
    unwatchButton.addEventListener('click', (event) => {
        watchFetch(userData.email, false);
    })

    if (userData.id === userId) {
        editButton.style.display="block";
        watchButton.style.display="none";
        unwatchButton.style.display="none";
    }
    else {
        if (userData.watcheeUserIds.includes(userId)) {
            unwatchButton.style.display="block";
            watchButton.style.display="none";
        }
        else {
            watchButton.style.display="block";
            unwatchButton.style.display="none";
        }
        editButton.style.display="none";  
    }

    profName.textContent = userData.name;
    profUID.textContent = userData.id;
    profEmail.textContent = userData.email;
    profImage.setAttribute('src', userData.image);
    profImage.setAttribute('alt', ' Profile-Picture');
    profImage.classList.add('image-class');
    
    genProfFollowers(userData.watcheeUserIds);
    genProfAllJobs(userData.jobs);

}

// This function generates a list of followers for a 
// particular person on their profile site.
function genProfFollowers(list) {
    const div = document.getElementById('profile-followers-container');
    let count = 0;
    list.forEach((follower) => {
        count += 1;
        const followerPanel = document.createElement('div');
        followerPanel.classList.add('clickable');
        
        div.appendChild(followerPanel);
        
        var url= new URL(`${backendURL}/user`);
        const params = {
            "userId": follower,
        }
        
        for (let k in params) {
            url.searchParams.append(k, params[k]);
        }
        
        getReq(url).then(data => {
            followerPanel.textContent = data.name;
            followerPanel.addEventListener('click', (event) => {
                showProfile(data.id);
            })
        })
        .catch((error) => { console.log(error); })
        
    })
    const followerTitle = document.getElementById('profile-followers-title');
    followerTitle.innerText = "Followers: " + count;
}

// This function generates a job post for each job 
// that has posted. This shows up on a user's profile section
function genProfAllJobs(jobList) {
    const jobContainer = document.getElementById('profile-jobs-container');
    jobList.forEach((job) => {
        const jobDiv = document.createElement('div');
        genProfEachJob(jobDiv, jobContainer, job);
        jobDiv.style.backgroundColor="#f3f2ef";
        jobDiv.style.margin="20px 0";
        jobDiv.style.borderRadius="8px";
        
    })
}

// This function generates the details for each 
// job post generated by genProfAllJobs
function genProfEachJob(div, feed, data) {
    insertTitle(div, data.title);
    insertPostDate(div, data.createdAt);
    insertImage(div, data.image);
    insertStartDate(div, data.start);
    insertAuthor(div, data, feed, data.creatorId, 'profile');
    insertDesc(div, data.description);
}

// This function displays the like/comment list
// panels
function showPanel(likePanel) {
    if (likePanel.style.display === 'none') {
        likePanel.style.display = 'block';
    }
    else {
        likePanel.style.display = 'none';
    }
}

// This function counts the number of comments that 
// a job post has and creates a trigger for the 
// panel of comments
function insertComments(div, commentsList) {
    let cmntDiv = document.createElement('div');
    cmntDiv.setAttribute('id', `feed-comment-${postId}`);
    cmntDiv.style.padding="0";
    cmntDiv.style.height="30px";
    cmntDiv.style.marginTop="10px";
    
    let count = 0;
    commentsList.forEach((comment) => {
        count += 1;
    })
    let countText = count.toString(10);
    let string = "Comments: " + countText;
    let commentString = document.createTextNode(string);
    let commentEle = document.createElement('p');
    commentEle.appendChild(commentString);
    commentEle.classList.add('clickable');
    cmntDiv.appendChild(commentEle);
    
    div.appendChild(cmntDiv);
    const commentPanel = genComments(div, commentsList, cmntDiv);

    cmntDiv.addEventListener(('click'), event => {
        showPanel(commentPanel);
    });
}

// This function generates the comment div and
// calls the genPanel function to generate the
// comments
function genComments(div, commentsList) {
    let commentPanel = document.createElement('div');
    genPanel(div, commentPanel, commentsList, 'comment');
    return commentPanel;
}


// This function adds the comment submission text
// area to each post and creates the mechanism
// through which a post is made
function insertCommentBar(div, postId, commentItem) { 
    const commentBar = document.createElement('textarea');
    commentBar.classList.add('form-control');
    commentBar.style.marginTop = "0";
    commentBar.setAttribute('placeholder', 'Write a comment and press enter to submit...');
    div.appendChild(commentBar);

    commentBar.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            if (commentBar.value === '') {
                showPopup("Please enter a message first.");
            }
            else {
                submitComment(commentBar.value, postId);
            }
        }
    });
    commentItem.addEventListener('click', (event) => {
        if (commentBar.value == "") {
            showPopup("Please enter a message first.");
        }
        else {
            submitComment(commentBar.value, postId);
        }
    })
}

// This function submits a comment to the backend
function submitComment(comment, postId) {
    let data = {
        id: postId,
        comment: comment,
    }
    fetch(`${backendURL}/job/comment`, {
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
            showPopup(data.error);
        } 
        else {
            showPopup("Comment submitted!");
        }
    })
}

// This function inserts the edit and delete buttons for
// posts that are owned by the current viewer
function insertEditDel(div, data) {
    const ruler = document.createElement('hr');
    div.appendChild(ruler);
    const buttonContainer = document.createElement('div');
    const editButton = document.createElement('button');
    editDelButton(editButton, 'Edit');
    
    const delButton = document.createElement('button');
    editDelButton(delButton, 'Delete');
    
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(delButton);

    buttonContainer.classList.add('page-buttons');
    div.appendChild(buttonContainer);

    editButton.addEventListener('click', (event) => {
        currPost = data.id;
    })
    delButton.addEventListener('click', (event) => {
        deleteComment(data.id);
    })
}

// This function styles adds the buttons for 
// editing and deleting
function editDelButton(button, string) {
    button.classList.add('btn');
    button.classList.add('btn-primary');
    button.classList.add('clickable');
    button.style.margin = "0 10px 10px 10px";
    button.textContent = string;
    if (string === 'Edit') {
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#edit-post-modal');
    }
}

// This listener is responsible for post editing 
const editPostForm = document.getElementById('edit-post-form');
editPostForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const image = document.getElementById('edit-post-img').files[0];
    const imageProcessed = fileToDataUrl(image);
    
    imageProcessed.then(filepath => {
        let data = {
            id: currPost,
            title: document.getElementById('edit-post-title').value, 
            image: filepath,
            start: document.getElementById('edit-post-date').value,
            description: document.getElementById('edit-post-desc').value,
        }
        return fetch(`${backendURL}/job`, {
            method: 'PUT', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(data),
        })
    })
    .then(response => response.json())
    .then(data => { 
        if (typeof data.error !== 'undefined') {
            showPopup(data.error);
        } 
        else {
            showPopup("Job updated!");
        }
    })

})

// This function allows the user to delete a post
// from the backend
function deleteComment(postId) {
    let data = {
        id: postId,
    }
    fetch(`${backendURL}/job`, {
        method: 'DELETE', 
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
            showPopup(data.error);
        } 
        else {
            showPopup("Job deleted!");
        }
    })
}

// Event Listener For Making Posts
const postForm = document.getElementById('post-form');
postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const postTitle = document.getElementById('post-title');
    const postDesc = document.getElementById('post-desc');
    const date = document.getElementById('post-date');
    const image = document.getElementById('post-img').files[0];
    const imageProcessed = fileToDataUrl(image);

    imageProcessed.then(filepath => {
        var data = {
            title: postTitle.value,
            image: filepath,
            start: date.value,
            description: postDesc.value,
        }
        return fetch(`${backendURL}/job`, {
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(data),
        })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            showPopup(data.error);
        }
    })
    .catch((error) => { console.log(error); })
});

// Event Listener For Editing Profile 
const editForm = document.getElementById('profile-form');
editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const image = document.getElementById('profile-img').files[0];
    const imageProcessed = fileToDataUrl(image);
    imageProcessed.then(filepath => {
        var data = {
            email: document.getElementById('profile-email').value,
            password: document.getElementById('profile-password').value,
            name: document.getElementById('profile-name').value,
            image: filepath,
        }
    
        return fetch(`${backendURL}/user`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(data),
        })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data.error !== 'undefined') {
            showPopup(data.error);
        }
    })
    .catch((error) => { console.log(error); })
})

// Banner Icons
const logoutBanner = document.getElementById('banner-logout');
logoutBanner.addEventListener('click', (event) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    const banner = document.getElementById('banner-section');
    banner.style.display="None";
    const loginSect = document.getElementById('login-section');
    displayContent(loginSect);
});

const homeBanner = document.getElementById('banner-home');
homeBanner.addEventListener('click', (event) => {
    const homeSect = document.getElementById('main-feed-section');
    displayContent(homeSect);
    start = 0;
    getFeed(token, start, userId);
});

const myProfile = document.getElementById('banner-profile');
myProfile.addEventListener('click', (event) => {
    showProfile(userId);
});

const bannerFollow = document.getElementById('banner-follow');
bannerFollow.addEventListener(('click'), (event) => {
    $('#banner-follow-modal').modal('show');
})

const bannerFollowForm = document.getElementById('banner-follow-form');
bannerFollowForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const bannerSubmit = document.getElementById('follow-email');
    watchFetch(bannerSubmit.value, true);
})

// Modal Togglers
$('#edit-post-form').submit(function() {
    $('#edit-post-modal').modal('hide'); 
    return false;
});

$('#profile-form').submit(function() {
    // Coding
    $('#profile-modal').modal('hide'); 
    return false;
});

$('#post-form').submit(function() {
    $('#post-modal').modal('hide'); 
    return false;
});

$('#banner-follow-form').submit(function() {
    $('#banner-follow-modal').modal('hide'); 
    return false;
});

function showPopup(text) {
    const message = document.getElementById('error-message');
    message.textContent = text;
    $('#popup-modal').modal('show');
}