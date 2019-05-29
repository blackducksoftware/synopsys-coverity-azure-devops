# Synopsys-Coverity-Azure-DevOps

Build with:
tfx extension create --manifest-globs vss-extension.json

Compile task with:
cd coverityTask && powershell .\compile_and_test.ps1 && cd ..

For a new version, change the task:
task.json, version: major/minor/patch
vss-extension.json, version