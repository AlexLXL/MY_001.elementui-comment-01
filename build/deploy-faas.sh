#! /bin/sh
set -ex
mkdir temp_web
npm run deploy:build
cd temp_web
git clone --depth 1 -b gh-pages --single-branch https://github.com/ElemeFE/element.git && cd element

# build sub folder
SUB_FOLDER='2.12'
mkdir -p $SUB_FOLDER
rm -rf *.js *.css *.map static
rm -rf $SUB_FOLDER/**
cp -rf ../../examples/element-ui/** .
cp -rf ../../examples/element-ui/** $SUB_FOLDER/
cd ../..

# deploy domestic site
faas deploy alpha -P element
rm -rf temp_web

# a.在build目录下，新建temp_web目录；
# b.执行npm run deploy:build；
# b1. npm run build:file：见前文，主要处理icon、生成src/index和国际化相关；
# b2. webpack --config build/webpack.demo.js：见下文，主要用于生成或更新example目录；
# b3. echo element.eleme.io>>examples/element-ui/CNAME"：examples/element-ui/CNAME文件中写入element.eleme.io：Managing a custom domain for your GitHub Pages site
# c.克隆element的gh-pages分支(可以通过http://elemefe.github.io/element/访问，实际会根据CNAME文件的设置，路由到element.eleme.io，在这里进行cname查询)，并进入element目录；
# d.根据版本号新建目录，如2.13，然后将第b步中输出目录（examples/element-ui）里的内容拷贝到新建目录（2.13）里；
# e.部署：faas deploy alpha -P element
