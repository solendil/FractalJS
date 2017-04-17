rm -fr ../solendil.github.io/fractaljs3
cp -R dist/ ../solendil.github.io/fractaljs3
cd ../solendil.github.io
git add -A
git commit -m "new version"
git push
cd -
