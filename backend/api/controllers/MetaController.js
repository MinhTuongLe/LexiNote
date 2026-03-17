module.exports = {
  health: function(req, res) {
    return res.json({
      status: 'success',
      message: 'LexiNote API is alive and kicking! 🐰✨',
      timestamp: new Date().toISOString()
    });
  }
};
