@echo off
set PI=anienhuis@phecda.local
set SRC=octoprint_bettergrblsupport
set DEST=/opt/octopi/oprint/lib/python3.11/site-packages/octoprint_bettergrblsupport

echo Copying plugin files...
scp -r %SRC%/static %PI%:%DEST%/
scp -r %SRC%/templates %PI%:%DEST%/
scp %SRC%/__init__.py %PI%:%DEST%/
scp %SRC%/_bgs.py %PI%:%DEST%/
scp %SRC%/zprobe.py %PI%:%DEST%/

echo Clearing webasset cache and restarting OctoPrint...
ssh %PI% "rm -rf /home/anienhuis/.octoprint/generated/ && sudo systemctl restart octoprint"
echo Deploy complete.