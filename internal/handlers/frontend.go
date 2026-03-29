package handlers

import (
	"fmt"
	"net/http"
	"os"
	"stockviewer/internal/utilities"
	"strings"

	log "github.com/sirupsen/logrus"
)

var indexBuffer []byte
var cssBuffer []byte
var jsBuffer []byte
var jsCompileBuffer []byte
var translationsCompileBuffer []byte

func HandleIndexHTML(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	_, err := w.Write(indexBuffer)
	if err != nil {
		log.Errorf("Error while trying to serve the index.html: %v", err)
		return
	}
}
func HandleStyleCSS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/css")
	_, err := w.Write(cssBuffer)
	if err != nil {
		log.Errorf("Error while trying to serve the style.css: %v", err)
		return
	}
}
func HandleScriptJS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/javascript")
	_, err := w.Write(jsBuffer)
	if err != nil {
		log.Errorf("Error while trying to serve the script.js: %v", err)
		return
	}
}

func initBuffers() {
	log.Debug("Initialising buffers...")
	go func() {
		log.Debug("Initialising index buffer")
		index, err := os.ReadFile("./website/index.html")
		if err != nil {
			index = []byte("<h1>Internal Error!</h1>")
			log.Error(err)
		}
		indexBuffer = index
	}()
	go func() {
		log.Debug("Initialising CSS buffer")
		css, err := os.ReadFile("./website/style.css")
		if err != nil {
			log.Error(err)
		}

		cssBuffer = css
	}()
	go func() {
		log.Debug("Initialising JavaScript buffer")

		compileJSDir("./website/script/")

		jsBuffer = jsCompileBuffer

		log.Debug("Loading translations")
		translationsCompileBuffer = append(translationsCompileBuffer, []byte("{")...)

		compileTranslations("./website/translations")

		translationsCompileBuffer = translationsCompileBuffer[:len(translationsCompileBuffer)-2]
		translationsCompileBuffer = append(translationsCompileBuffer, []byte("}")...)

		jsBuffer = append(jsBuffer, []byte(`function initialiseLanguages() {
lang = {};
supportedLanguages = `)...)
		jsBuffer = append(jsBuffer, translationsCompileBuffer...)

		jsBuffer = append(jsBuffer, []byte("}\n")...)
	}()
}

func compileJSDir(path string) {
	dir, err := os.ReadDir(path)
	if err != nil {
		log.Error(err)
		return
	}
	for i := range dir {
		name := dir[i].Name()
		if dir[i].IsDir() {
			compileJSDir(fmt.Sprintf("%v%v/", path, name))
			continue
		}

		if strings.HasSuffix(name, ".js") {
			js, err := os.ReadFile(fmt.Sprintf("%v%v", path, name))
			if err != nil || js == nil {
				log.Error(err)
			}
			js = append(js, []byte("\n")...)
			jsCompileBuffer = append(jsCompileBuffer, js...)
		}
	}
}

func compileTranslations(path string) {
	dir, err := os.ReadDir(path)
	if err != nil {
		log.Error(err)
		return
	}
	for i := range dir {
		name := dir[i].Name()
		if dir[i].IsDir() {
			compileTranslations(fmt.Sprintf("%v%v/", path, name))
			continue
		}

		if strings.HasSuffix(name, ".json") {
			langname := name[:utilities.CharCount(name)-5]
			translation := []byte(fmt.Sprintf(`"%v": `, langname))

			file, err := os.ReadFile(fmt.Sprintf("%v/%v", path, name))
			if err != nil || file == nil {
				log.Error(err)
			}
			translation = append(translation, file...)
			translation = append(translation, []byte(",\n")...)
			translationsCompileBuffer = append(translationsCompileBuffer, translation...)
		}
	}
}
