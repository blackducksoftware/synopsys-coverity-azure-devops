# DEPRECATED: Synopsys-Coverity-Azure-DevOps

**Note:** This extension is deprecated and no longer supported. It is recommended that you migrate to our new <a href="https://marketplace.visualstudio.com/items?itemName=blackduck.blackduck-security-scan">Black Duck Security Scan</a>. Instructions can be found <a href="https://documentation.blackduck.com/bundle/bridge/page/documentation/c_security-scan-for-azure-devops.html">here</a>.

Build with:
tfx extension create --manifest-globs vss-extension.json

Compile task with:
cd coverityTask && powershell ./compile_and_test.ps1 && cd ..

For a new version, change the task:
task.json, version: major/minor/patch
vss-extension.json, version