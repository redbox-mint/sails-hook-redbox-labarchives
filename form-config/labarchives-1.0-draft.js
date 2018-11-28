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
        name: 'Login'
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
