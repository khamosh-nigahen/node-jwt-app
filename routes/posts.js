const router = require('express').Router()

router.get("/", (req, res) => {
    const posts = [
        {
            name: "Captain America",
            postTitle: "Shield"
        },
        {
            name: "Thor",
            postTitle: "Hammer"
        },
        {
            name: "Iron Man",
            postTitle: "Brain"
        },
        {
            name: "Puneet Jain",
            postTitle: "Great Dev!"
        }
    ]
    console.log(req.user);

    userPosts = posts.find(post => post.name === req.body.name)
    res.send(userPosts)
})

module.exports = router