#!/bin/bash
# deploy.sh: pulls latest code, installs requirements, migrates, collects static, restarts Gunicorn

PROJECT_DIR=/home/danscot/kimitsu

VENV_DIR=$PROJECT_DIR/venv

GUNICORN_SERVICE=kimitsu

echo "Deploy started: $(date)"

cd $PROJECT_DIR || exit

git stash

git pull --rebase

# activate virtualenv
source $VENV_DIR/bin/activate

# install/update requirements
pip install -r requirements.txt

# Django migrations
python manage.py migrate --noinput

# collect static files
python manage.py collectstatic --noinput

# restart gunicorn
sudo systemctl restart $GUNICORN_SERVICE

pm2 restart all

echo "Deploy finished: $(date)"