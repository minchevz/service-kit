module.exports = function (plop) {
  plop.setHelper(
    'generated_service_id',
    (ctx) =>
      ctx.data.root.generated_service_name
        ?.toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '-') ?? 'my-default-service'
  );

  plop.setHelper(
    'generated_file_id',
    (ctx) =>
      ctx.data.root.generated_service_name
        ?.toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '_') ?? 'my_default_service'
  );

  plop.setHelper(
    'generated_area_id',
    (ctx) =>
      ctx.data.root.generated_service_area
        ?.toLowerCase()
        .trim()
        .replace(/[\s-]+/g, '_') ?? 'my_default_area'
  );

  plop.setGenerator('Microservice Generator', {
    description: 'This is a skeleton plopfile for microservices',
    prompts: [
      {
        type: 'input',
        name: 'generated_service_name',
        message: 'What is your new service name?',
        validate: (value) => (/.+/.test(value) ? true : 'you must enter a service_name')
      },
      {
        type: 'input',
        name: 'generated_service_version',
        message: 'What is your service version?',
        default: '0.0.0'
      },
      {
        type: 'input',
        name: 'generated_service_port',
        message: 'What will the port be for your new service?',
        default: '3000'
      },
      {
        type: 'input',
        name: 'generated_service_description',
        message: 'What is the service description? What does it do ?',
        default: 'xxx'
      },
      {
        type: 'input',
        name: 'generated_service_lifecycle_stage',
        message: 'What is the lifecycle stage ?',
        default: 'Production'
      },
      {
        type: 'input',
        name: 'generated_service_area',
        message: 'Area of the service ?',
        default: 'Excite'
      },
      {
        type: 'input',
        name: 'generated_service_owner',
        message: 'Owner of the service ?',
        default: 'Unicorn'
      },
      {
        type: 'input',
        name: 'generated_service_supportedBy',
        message: 'Supported By ?',
        default: 'Unicorn/Pegacorn'
      },
      {
        type: 'input',
        name: 'generated_service_host_platform',
        message: 'Whats the host platform ?',
        default: 'Internal / Kubernetes'
      },
      {
        type: 'input',
        name: 'generated_service_rollback_type',
        message: 'Whats Rollback Process Type ?',
        default: 'PartiallyAutomated'
      },
      {
        type: 'input',
        name: 'generated_service_release_type',
        message: 'Whats Release Process Type ?',
        default: 'FullyAutomated'
      }
    ],
    // dotCase files like .env unfortunately do not work with
    // stripExtensions, and therefore cannot be made into template files for example `.env.hbs`
    // to prevent them being copied over as .myfile.hbs, the names remain as is until the following issue
    // is resolved. https://github.com/plopjs/node-plop/pull/192
    actions: [
      {
        type: 'addMany',
        base: 'template',
        destination: '{{generated_service_id}}',
        stripExtensions: ['hbs'],
        templateFiles: 'template/**/*',
        globOptions: { dot: true },
        force: true
      },
      {
        type: 'add',
        template: 'PORT={{generated_service_port}}',
        path: '{{generated_service_id}}/.env',
        force: true
      }
    ]
  });
};
