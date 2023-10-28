export default [
  {
    // get articles list
    url: '/articles',
    response: Array(10) // response is array
      .fill()
      .map((_, i) => {
        i += 1000;
        return {
          id: i,
          title: `文章标题${i}`,
          content: `文章内容${i}`,
          author_id: `100${i}`,
        };
      }),
  },

  {
    // create a article
    url: '/article',
    method: 'post',
    timeout: 500, // delay 500ms
    response: (_, res) => {
      // response is function
      res.status(201);
      return {
        id: 1,
        title: `文章标题`,
        content: `文章内容`,
        author_id: `100`,
      };
    },
  },

  {
    // get a article detail by id
    url: '/article/:id',
    response: (req) => {
      // response is a promise
      const id = req.params.id;
      const body = {
        id,
        title: `文章标题${id}`,
        content: `文章内容${id}`,
        starts: 11,
        shares: 22,
        comments: 111,
        author_id: `100${id}`,
      };
      return new Promise((resolve) => {
        setTimeout(() => resolve(body), 100);
      });
    },
  },

  {
    // update a article by id
    url: '/article/:id',
    method: 'patch',
    response: 1, // response is a number
  },

  {
    // delete a article by id
    url: '/article/:id',
    method: 'delete',
    response: {
      effectRows: 1, // response is an object
    },
  },
];
