#!/bin/bash
# deploy.sh: pulls latest code, installs requirements, migrates, collects static, restarts Gunicorn

PROJECT_DIR=/home/danscot/kimitsu
VENV_DIR=$PROJECT_DIR/venv
GUNICORN_SERVICE=kimitsu

echo "Deploy started: $(date)"

cd $PROJECT_DIR || exit
git reset --hard
git pull origin main

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

echo "Deploy finished: $(date)"