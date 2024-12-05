module.exports.workspacetype = {
  'labarchives': {
    name: 'labarchives',
    label: 'LabArchives',
    subtitle: 'LabArchives',
    description: 'Web-based electronic notebooks (provided by LabArchives) are useful for managing research documentation, observations and data.',
    logo: '/images/la.png',
    action: {default: 'list', available: ['create', 'list']},
    app: {
      id: 'labarchives'
    }
  }
};
