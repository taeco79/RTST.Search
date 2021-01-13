# RTST.Search

sudo apt update

sudo apt upgrade

sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
"deb [arch=amd64] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) \
stable"

sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io

docker -v

sudo systemctl enable docker && service docker start

systemctl status docker

https://github.com/docker/compose/releases

sudo curl -L https://github.com/docker/compose/releases/download/1.28.0-rc2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version

sudo docker network create --gateway 172.18.0.1 --subnet 172.18.0.0/16 taeco 


