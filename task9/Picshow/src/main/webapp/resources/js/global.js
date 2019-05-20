const Global = (function () {

    let postsList;
    let view;
    let user;
    let fConfigs;
    let shownPosts;

    function restoreUser() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            return undefined;
        }
        return user;
    }

    (async () => {
        try {
            user = restoreUser();
            if (user) {
                let ans = await PostsList.login(user);
                if (ans.answer === "fail") {
                    user = undefined;
                }
            }
            fConfigs = {};
            const data = JSON.parse(localStorage.getItem('filterForm'));
            Object.keys(data).forEach(config => {
                if (config.length) {
                    fConfigs.config = data[config];
                }
            });
            let res = await PostsList.getPage(0, 10, fConfigs);
            if(res!=null){
            shownPosts = res.length;
            postsList = new PostsList(res, user);
            view = new View(res, user);}
            else{
                //show nothing page
            }
        } catch (e) {
            alert(e);
        }
    })();


    async function showMorePosts() {
        let posts = await PostsList.getPage(shownPosts, 10, fConfigs);
        shownPosts += posts.length;
        view.showMorePosts(posts);
    }

    async function logOut() {
        localStorage.removeItem('user');
        let posts = await PostsList.getPage();
        postsList = new PostsList(posts);
        view = new View(posts);
        view.logout();
    }

    function back() {
        view.back();
        view.updateHeader();
    }

    async function filterPosts(filterConfig) {
        const filteredPosts = await PostsList.getPage(0, 10, filterConfig);
        fConfigs = filterConfig;
        shownPosts = filteredPosts.length;
        view.showPosts(filteredPosts);
    }

    async function findAllIncludes(param) {
        let filteredPosts = await PostsList.getPage(0, postsList._photoPosts.length, {author: param});
        shownPosts = filteredPosts.length;
        view.showPosts(filteredPosts);
    }


    async function addPhotoPost(post) {
        if(!PostsList.validatePost(post)){
            return false;
        }
        let res = await PostsList.addPost(post);
        if (res.answer !== "fail") {
            let posts = await PostsList.getPage(0, 10, fConfigs);
            shownPosts = posts.length;
            view.showPosts(posts);
            return true;
        }
        return false;
    }

    async function remove(id) {
        try {
            let res = await PostsList.remove(id);
            if (res.answer === "removed") {
                view.remove(id);
            }
            console.log(res);
        } catch (e) {
            alert(e);
        }
    }


    async function showPosts() {
        view.showPosts( await PostsList.getPage());
    }

    async function likeThis(id) {
        try {
            let res = await PostsList.likePost(id);
            view.toggleLike(id, res.count);
        } catch (e) {
            alert(e);
        }
    }

    async function loginUser(user) {
        let res = await PostsList.login(user);
        if (res.answer !== "fail") {
            _user = user;
            localStorage.setItem('user', JSON.stringify(_user));
            let posts = await PostsList.getPage();
            postsList = new PostsList(posts, user);
            view = new View(posts, user);
            view.loginUser();
        }
    }

    async function editPost(id, filterConfig) {
        let res = await PostsList.edit(id, filterConfig);
        if (res.answer !== "fail") {
            let posts = await PostsList.getPage(0, 10, fConfigs);
            view.showPosts(posts);
            shownPosts = posts.length;
            return true
        }
        return false;
    }

    function newPost() {
        view.createNewPost();
    }

    async function setEditPageData(id) {
        const post = await PostsList.getById(id);
        view.setEditPageData(post);
    }


    return {
        addPhotoPost,
        showFirstPosts: showPosts,
        remove,
        showMorePosts,
        filterPosts,
        editPost,
        likePost: likeThis,
        logOut,
        back,
        setEditPageData,
        loginUser,
        newPost,
        findAllIncludes,
    };
}());
