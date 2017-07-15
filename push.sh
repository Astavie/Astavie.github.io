if [ "$1" == "" ] || [ "$2" == "" ]; then
	echo "usage: bash push.sh <archiveId> <message>"
else
	git add "./$1"
	git commit -m "$2"
	git push
fi
