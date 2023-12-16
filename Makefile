
import-scheme-openmaptiles:
	find ../_forked/openmaptiles/layers/ | grep yaml | grep -v mapping | xargs -I {} cp {} ./scheme/openmaptiles/layers/