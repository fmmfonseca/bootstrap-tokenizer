CHECK=\033[32m✔\033[39m
DATE=$(shell date +%I:%M%p)
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#

build:
	@echo "\n${HR}"
	@echo "Building Bootstrap Tokenizer..."
	@echo "${HR}\n"
	@./node_modules/.bin/jshint js/bootstrap-tokenizer.js --config js/.jshintrc
	@echo "Running JSHint on javascript...             ${CHECK} Done"
	@mkdir -p build/js
	@cp js/*.js build/js/
	@./node_modules/.bin/uglifyjs -nc ./js/bootstrap-tokenizer.js > ./build/js/bootstrap-tokenizer.min.js
	@echo "Compiling and minifying javascript...       ${CHECK} Done"
	@mkdir -p build/css
	@./node_modules/.bin/recess --compile ./less/tokenizer.less > ./build/css/bootstrap-tokenizer.css
	@echo "Compiling LESS with Recess...               ${CHECK} Done"
	@cp build/js/*.js docs/assets/js/
	@cp build/css/*.css docs/assets/css/
	@echo "Compiling documentation...                  ${CHECK} Done"
	@echo "\n${HR}"
	@echo "Bootstrap Tokenizer successfully built at ${DATE}."
	@echo "${HR}\n"

clean:
	rm -r build

.PHONY: build
