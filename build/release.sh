#!/usr/bin/env sh
set -e

git checkout master
git merge dev

VERSION=`npx select-version-cli`

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # build
  VERSION=$VERSION npm run dist

  # publish theme
  echo "Releasing theme-chalk $VERSION ..."
  cd packages/theme-chalk
  npm version $VERSION --message "[release] $VERSION"
  if [[ $VERSION =~ "beta" ]]
  then
    npm publish --tag beta
  else
    npm publish
  fi
  cd ../..

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish
  git push eleme master
  git push eleme refs/tags/v$VERSION
  git checkout dev
  git rebase master
  git push eleme dev

  if [[ $VERSION =~ "beta" ]]
  then
    npm publish --tag beta
  else
    npm publish
  fi
fi

# a.checkout master分支，并合并dev分支；
# b.通过npx临时安装select-version-cli，与开发者进行交互，更新版本信息；
# c.执行npm run dist；
# d.测试ssr；
# e.进入packages/theme-chalk目录，利用npm version和npm publish，发布主题（packages/theme-chalk是个基于gulp的工程），由此可见elementUI的主题是可以独立发布的，不过会保证version跟elementUI保持一致；
# f.退回到根目录，提交代码并通过npm version更新版本（更新package.json中的版本号）；
# g.在当前分支（a步骤切换到master）push代码，然后checkout dev分支，并rebase master分支，最后push代码；
# h.如果version为beta，则通过npm publis --tag打上标签，否则直接publish
