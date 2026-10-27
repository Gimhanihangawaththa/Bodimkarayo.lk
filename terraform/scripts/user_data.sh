#!/bin/bash
set -e

# Update system packages
echo "Updating apt packages..."
apt-get update -y
apt-get upgrade -y

# Install prerequisites
apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# Set up Docker official GPG key and repository
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose Plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
systemctl enable docker
systemctl start docker

# Add default ubuntu user to docker group
usermod -aG docker ubuntu

# Increase virtual memory for Elasticsearch
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" >> /etc/sysctl.conf

echo "✓ Bodimkarayo host provisioning completed successfully."
