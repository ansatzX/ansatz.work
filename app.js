const express = require('express')
const app = express()
const port = process.env.PORT || 8080;

// 注释：搜索功能已在前端实现（searchScript.njk），此处保留接口以保持兼容性
// 如果需要服务端搜索，可以在此实现 searchHandler 函数
async function searchHandler(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Use client-side search' })
  };
}

app.get('/api/search', async (req, res) => {
  try {
    // Mock Netlify event
    let event = { queryStringParameters: req.query };
    let response = await searchHandler(event);
    res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
})

app.use(express.static('dist'))

app.get('*', (req, res) => {
  res.redirect('/404')
})

app.listen(port, () => {
  console.log(`Digital garden running on port ${port}`)
})
