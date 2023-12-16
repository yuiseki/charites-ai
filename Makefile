
all: build-style

.PHONY: build-style
build-style:
	npm run build-style

.PHONY: style
style:
	@echo "$(input)"
	npm run embed -- $(input)
	npm run build-style

.PHONY: import-scheme-openmaptiles
import-scheme-openmaptiles:
	find ../_forked/openmaptiles/layers/ | grep yaml | grep -v mapping | xargs -I {} cp {} ./scheme/openmaptiles/layers/
