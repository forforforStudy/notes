# gerrit 相关

当使用 git 工具 `push` 时, 实际是推送到 `git push gerrit HEAD:refs/for/<Branch>` 上.

所工程院中使用 gerrit 需要几个步骤

1. clone with commit-msg hook

如下命令

> `git clone ssh://282712@gerrit.sdp.nd:29418/app-web/learningobjectives-editor && scp -p -P 29418 282712@gerrit.sdp.nd:hooks/commit-msg learningobjectives-editor/.git/hooks/`

这里分成两个部分