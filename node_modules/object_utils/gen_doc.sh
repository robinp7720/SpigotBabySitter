#!/bin/sh

# Generate jsduck documentation
# See [https://github.com/senchalabs/jsduck]

jsduck  object_utils.js \
        --output="doc" \
        --title="object_utils documentation" \
		--footer="Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo" \
        --warnings=-link,-dup_member,-no_doc \
		--touch-examples-ui
