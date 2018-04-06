package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	r.Handle("/", http.RedirectHandler("/instruction", http.StatusFound))
	r.HandleFunc("/submitFile", submitFile)
	fs := http.FileServer(http.Dir("build"))
	r.PathPrefix("/build/").Handler(http.StripPrefix("/build/", fs))
	// http.HandleFunc("/", welcome)

	log.Println("Listening...")
	http.ListenAndServe(":3000", r)
}

func submitFile(w http.ResponseWriter, r *http.Request) {
	requestDump, err := httputil.DumpRequest(r, true)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(string(requestDump))
	fmt.Println("method:", r.Method) //get request method
	fmt.Fprintf(w, "Hello, you've submit: %s\n", r.URL.Path)
	// fmt.Fprintf(w, "Scheme: %s\n", r.URL.Scheme)

	fmt.Println("dropzone:", r.Form["dropzone"])
	fmt.Println("imageuri:", r.Form["imageuri"])
	for k, v := range r.Form {
		fmt.Println("key:", k)
		fmt.Println("val:", strings.Join(v, ""))
	}
}
