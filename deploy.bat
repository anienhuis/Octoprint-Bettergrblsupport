@echo off
set PI=anienhuis@phecda.local
set DEST=/opt/octopi/oprint/lib/python3.11/site-packages/octoprint_bettergrblsupport

scp octoprint_bettergrblsupport/static/js/bettergrblsupport_control.js %PI%:%DEST%/static/js/
scp octoprint_bettergrblsupport/static/js/bgs_probe.js %PI%:%DEST%/static/js/
scp octoprint_bettergrblsupport/static/css/bgs_probe.css %PI%:%DEST%/static/css/
scp octoprint_bettergrblsupport/templates/bettergrblsupport_control.jinja2 %PI%:%DEST%/templates/
scp octoprint_bettergrblsupport/__init__.py %PI%:%DEST%/
scp octoprint_bettergrblsupport/_bgs.py %PI%:%DEST%/

ssh %PI% "rm -rf /home/anienhuis/.octoprint/generated/ && sudo systemctl restart octoprint"
echo Deploy complete.