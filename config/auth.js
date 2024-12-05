module.exports.auth = {
  rules: [
    {
      path: '/:branding/:portal/ws/labarchives(/*)',
      role: 'Researcher',
      can_update:true
    }
  ]
};