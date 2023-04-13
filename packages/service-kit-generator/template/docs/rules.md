## Rules
  **ᕦ⊙෴⊙ᕤ**
### Hooks and Linting
  The repo is using [husky](https://github.com/typicode/husky) to run pre-commit and pre-push hooks.
  Ths husky configuration can be found in `.huskyrc`

  Linting is run on pre-commit using [lint-staged](https://github.com/okonet/lint-staged#readme) configuration for it lives in `.lintstagedrc`) and lints all .js/.ts and .yaml files in the repo.
  Linting .yml uses [yamllint](https://yamllint.readthedocs.io/en/stable/) with the configuration for it being in `yamllint-cofig.yaml` which is modifying the relaxed ruleset for linting yaml.

  Additional rules for formatting yaml files are enforced in the `.editorconfig` living in the repo root. this will be used by the editor when modifying yaml files.

  Additionally to that,  there's a  **YAML Sort** VSCode plugin that has support for formatting, sorting and validating yaml which can be run manually over yaml files.

  The plugin supports quite a few commands that can be run from the vscode command palette *(Cmd+Shift+P)*.

  To reformat your yaml files according to the ruleset type in hte command palette:
  ```sh
    Format YAML
  ```

  To validate a given yaml file:
  ```sh
    Validate YAML
  ```

### Action workflows on PR

There is a workflow running on PR that runs yamllint against the branch. The Workflow runs on a self-hosted unicorn runner (the label is `unicorn`) which is available for all private repositories under PlayerServices.

The workflow can be found under `.github/workflows/lint-yml.yml` and should run automatically on every push once a pre against master is created.
