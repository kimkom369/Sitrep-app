const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  }).catch(error => {
    res.status(500).json({
    message: 'Creating a post failed!'
    })
  })
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.creator
  });
  Post.updateOne({ _id: req.params.id , creator: req.userData.userId }, post)
  .then(result => {
    if (result.n > 0) {
      res.status(200).json({ message: "Update successful!" });
    } else {
      res.status(401).json({message: 'Unauthorized User !'});
    }
  }).catch(error =>{
    res.status(500).json({
      message: 'Could not update post!'
    })
  });
}

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fecthedPosts;
  if (pageSize && currentPage ) {
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);

  }
  postQuery.then(documents => {
    fecthedPosts = documents;
    return  Post.countDocuments();
  })
  .then(count => {
    res.status(200).json({
      message: 'Post fecthed successfully',
      posts: fecthedPosts,
      maxPosts: count
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Fetchin posts failed !'
    })
  });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Fetchin post failed !'
    })
  });
}


exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId}).then(result => {
    if (result.n > 0) {
      res.status(200).json({ message: "Post deleted !" });
    } else {
    res.status(401).json({ message: "Unathorized User !" });
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Fetchin post failed !'
    })
  });
}



