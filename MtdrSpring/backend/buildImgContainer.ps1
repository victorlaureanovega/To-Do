# Best-effort cleanup of previous container/image versions.
docker stop agilecontainer 2>$null
docker rm -f agilecontainer 2>$null
docker rmi agileimage:0.1 2>$null
docker rmi agileimage:latest 2>$null
mvn clean verify
docker build -f DockerfileDev --platform linux/amd64 -t agileimage:0.1 .
docker tag agileimage:0.1 agileimage:latest
docker run --name agilecontainer -p 8080:8080 -d agileimage:0.1
