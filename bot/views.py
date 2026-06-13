from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework.exceptions import ValidationError

from rest_framework import status

from django.db import transaction

from datetime import datetime

import subprocess

import psutil

import platform

import re

import time

# ----------------------------
# Utility functions
# ----------------------------
def clean_number(raw: str) -> str:

    cleaned = re.sub(r"[ \+\-\(\)]", "", raw)

    if not cleaned.isdigit():

        raise ValidationError("Donnez un numéro valide")

    if len(cleaned) < 10 or len(cleaned) > 15:

        raise ValidationError("Numéro Invalid: Vous devez ajoutez le code du pays. Example +237 pour le cameroon.")

    return cleaned


def to_gb(bytes_value):

    return round(bytes_value / (1024 ** 3), 2)  # Convert bytes → GB


def get_user(username):

    user = CustomUser.objects.filter(username=username).first()

    if not user:

        return 0  # or None

    return user

# ----------------------------
# ----------------------------

@api_view(["GET"])

def root(request):

    return Response({"status": "Ok", "message": "Bot API System Is Running"})
from pathlib import Path
import os
import subprocess

BASE_DIR = Path(__file__).resolve().parent.parent
BOT_DIR = BASE_DIR / "bot_core"

PM2_PATH = "/usr/local/bin/pm2"
NODE_PATH = "/usr/bin/node"


@api_view(["POST"])
def pairing(request):
    target = request.data.get("number")

    if not target:
        return Response(
            {"status": "Failed", "message": "Missing number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target = clean_number(target)
    except ValidationError as e:
        return Response(
            {"status": "Failed", "message": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user

    if not user:
        return Response(
            {"status": "Failed", "message": "User not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not user.is_subscription_active or not user.can_pair:
        return Response(
            {
                "status": "Failed",
                "message": "Vous devez activez un abonnement pour continuer.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    duration = str(int(user.subscription_expiry.timestamp()))

    bot_name = f"session-{target}"

    env = os.environ.copy()

    env.update(
        {
            "PATH": "/usr/local/bin:/usr/bin:/bin",
            "NUMBER": target,
            "PM2_PROCESS_NAME": bot_name,
            "SESSION_DURATION_SEC": duration,
        }
    )

    try:
        with transaction.atomic():

            result = subprocess.run(
                [
                    PM2_PATH,
                    "start",
                    "web-paire.js",
                    "--name",
                    bot_name,
                    "--interpreter",
                    NODE_PATH,
                ],
                cwd=BOT_DIR,
                env=env,
                capture_output=True,
                text=True,
                check=True,
            )

    except subprocess.CalledProcessError as e:
        return Response(
            {
                "status": "Error",
                "message": e.stderr.strip() or e.stdout.strip(),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    user.bot_number = target
    user.paired_num += 1
    user.save()

    return Response(
        {
            "status": "Launched",
            "number": target,
            "process": bot_name,
            "expires_at": duration,
            "pm2_output": result.stdout,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def list_sessions(request):

    try:
        result = subprocess.run(
            [PM2_PATH, "jlist"],
            env={
                **os.environ,
                "PATH": "/usr/local/bin:/usr/bin:/bin",
            },
            capture_output=True,
            text=True,
            check=True,
        )

    except subprocess.CalledProcessError as e:
        return Response(
            {
                "status": "Error",
                "message": e.stderr.strip() or e.stdout.strip(),
            },
            status=500,
        )

    import json

    try:
        processes = json.loads(result.stdout)
    except Exception:
        return Response(
            {
                "status": "Error",
                "message": "Unable to parse PM2 output",
            },
            status=500,
        )

    sessions = []

    for proc in processes:
        name = proc.get("name", "")

        if name.startswith("session-"):
            sessions.append(
                {
                    "pm_id": proc.get("pm_id"),
                    "name": name,
                    "status": proc.get("pm2_env", {}).get("status"),
                    "pid": proc.get("pid"),
                    "cpu": proc.get("monit", {}).get("cpu"),
                    "memory": proc.get("monit", {}).get("memory"),
                }
            )

    return Response(
        {
            "count": len(sessions),
            "sessions": sessions,
        }
    )
    

@api_view(["GET"])

def system_usage(request):

    # CPU
    cpu_percent = psutil.cpu_percent(interval=0.5)

    cpu_cores = psutil.cpu_count(logical=True)

    # RAM
    ram = psutil.virtual_memory()

    ram_total_gb = to_gb(ram.total)

    ram_used_gb = to_gb(ram.used)

    ram_percent = ram.percent

    # Disk
    disk = psutil.disk_usage('/')

    disk_total_gb = to_gb(disk.total)

    disk_used_gb = to_gb(disk.used)

    disk_percent = disk.percent

    # Network
    net = psutil.net_io_counters()
    
    bytes_sent = net.bytes_sent

    bytes_recv = net.bytes_recv

    # Uptime
    
    boot_time = psutil.boot_time()
    
    uptime_seconds = int(time.time() - boot_time)

    # System info
    
    system = platform.system()
    
    release = platform.release()
    
    machine = platform.machine()

    
    return Response({
    
        "cpu": {"usage_percent": cpu_percent, "cores": cpu_cores},
    
        "ram": {"total_gb": ram_total_gb, "used_gb": ram_used_gb, "usage_percent": ram_percent},
    
        "disk": {"total_gb": disk_total_gb, "used_gb": disk_used_gb, "usage_percent": disk_percent},
    
        "network": {"bytes_sent": bytes_sent, "bytes_received": bytes_recv},
    
        "uptime_seconds": uptime_seconds,
    
        "system_info": {"os": system, "release": release, "arch": machine}
    })
