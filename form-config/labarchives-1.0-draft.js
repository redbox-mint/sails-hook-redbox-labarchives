/**
 * Template form
 */
module.exports = {
  name: 'labarchives-1.0-draft',
  type: 'labarchives',
  customAngularApp: {
    appName: 'labarchives',
    appSelector: 'labarchives-form'
  },
  skipValidationOnSave: true,
  editCssClasses: 'row col-md-12',
  viewCssClasses: 'row col-md-offset-1 col-md-10',
  messages: {
    'saving': ['@dmpt-form-saving'],
    'validationFail': ['@dmpt-form-validation-fail-prefix', '@dmpt-form-validation-fail-suffix'],
    'saveSuccess': ['@dmpt-form-save-success'],
    'saveError': ['@dmpt-form-save-error']
  },
  fields: [
    {
      class: 'Container',
      compClass: 'TextBlockComponent',
      viewOnly: false,
      definition: {
        name: 'title',
        value: 'LabArchives',
        type: 'h2'
      }
    },
    {
      class: 'LabarchivesLoginField',
      viewOnly: false,
      definition: {
        name: 'Login',
        loginLabel: 'Login',
        usernameLabel: 'UTS email address',
        passwordLabel: 'LabArchives Password Token for External applications',
        helpLoginLabel: 'To get your Lab Archives password token:',
        helpLoginLabelList: [
          'Log in to LabArchives',
          'In the top right, choose the user menu',
          'Select LA App authentication',
          'Copy the token from Use this password',
          'Come back to this screen',
          'Enter your UTS email address',
          'Paste the password token you copied above into LabArchives Password Token for External applications.'
        ],
        loginHelpImageAlt: 'labarchives help login',
        loginHelpImage: '/angular/labarchives/assets/images/labarchives-help-login.png',
        closeLabel: 'Close'
      }
    },
    {
      class: 'LabarchivesListField',
      viewOnly: false,
      definition: {
        name: 'List'
      }
    },
    {
      class: 'LabarchivesLinkField',
      viewOnly: false,
      definition: {
        name: 'Link'
      }
    },
    {
      class: "AnchorOrButton",
      viewOnly: false,
      definition: {
        name: "BackToPlan",
        label: 'Back to your Plan',
        value: '/@branding/@portal/record/edit/',
        cssClasses: 'btn btn-large btn-info',
        showPencil: false,
        controlType: 'anchor'
      },
      variableSubstitutionFields: ['value']
    }
  ]
};
