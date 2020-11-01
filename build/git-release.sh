#!/usr/bin/env sh
git checkout dev

if test -n "$(git status --porcelain)"; then
  echo 'Unclean working tree. Commit or stash changes first.' >&2;
  exit 128;
fi

if ! git fetch --quiet 2>/dev/null; then
  echo 'There was a problem fetching your branch. Run `git fetch` to see more...' >&2;
  exit 128;
fi

if test "0" != "$(git rev-list --count --left-only @'{u}'...HEAD)"; then
  echo 'Remote history differ. Please pull changes.' >&2;
  exit 128;
fi

echo 'No conflicts.' >&2;

# 在linux的一些bash的脚本，需在开头一行指定脚本的解释程序， #!/usr/bin/env sh， #!/usr/bin/env python

# if test -n 字符串的长度不为零则为真
# $()是将括号内命令的执行结果赋值给变量
  # (base) zeng@zeng-X11DAi-N:~/workspace$ ls
  # a.sh  data.sh  results.txt
  # 将命令 ls 赋值给变量 a
  # (base) zeng@zeng-X11DAi-N:~/workspace$ a=$(ls)

# git status --porcelain
  # --porcelain=<version>
  # 为脚本提供易于解析格式的输出

# git fetch --quiet
  # --quiet
  # 将--quiet传递给git-fetch-pack并静音任何其他内部使用的git命令。 进展不会报告给标准错误流。

# 2>/dev/null
  # Linux系统预留可三个文件描述符：0、1和2
    # 0——标准输入（stdin）
    # 1——标准输出（stdout）
    # 2——标准错误（stderr）
  # >
    # 重定向的符号有两个：>或>>，两者的区别是：前者会先清空文件，然后再写入内容，后者会将重定向的内容追加到现有文件的尾部。
  # /dev/null是linux一个特殊的设备文件，这个文件接收到任何数据都会被丢弃。
    # 2>/dev/null的意思就是将标准错误stderr删掉

# git rev-list 对比两个commit的提交时间谁更早
  # git rev-list <commit-id-1>..<commit-id-2> --count
    # 如果结果大于 0：commit-id-2 比 commit-id-1 新（commit-id-2 ahead commit-id-1）
  # --count
    # 打印一个数字，说明有多少提交将被列出，并禁止所有其他输出。与其一起使用时--left-right，将打印左侧和右侧提交的计数，并用制表符分隔。

# >&2 也就是把结果输出到和标准错误一样
# git did not exit cleanly (exit code 128)
