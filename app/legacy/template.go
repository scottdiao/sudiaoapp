// Copyright 2015 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

package main

import (
	"html/template"
	"net/http"
)

// parseTemplate applies a given file to the body of the base template.
func parseTemplate(filename string) *appTemplate {
	tmpl := template.Must(template.ParseFiles("build/index.html"))

	return &appTemplate{tmpl.Lookup("index.html")}
}

// appTemplate is a user login-aware wrapper for a html/template.
type appTemplate struct {
	t *template.Template
}

// Execute writes the template using the provided data, adding login and user
// information to the base template.
func (tmpl *appTemplate) Execute(w http.ResponseWriter, r *http.Request, data interface{}) *appError {
	// d := struct {
	// 	Data        interface{}
	// 	AuthEnabled bool
	// 	Profile     *Profile
	// 	LoginURL    string
	// 	LogoutURL   string
	// }{
	// 	Data:        data,
	// 	AuthEnabled: bookshelf.OAuthConfig != nil,
	// 	LoginURL:    "/login?redirect=" + r.URL.RequestURI(),
	// 	LogoutURL:   "/logout?redirect=" + r.URL.RequestURI(),
	// }
	//
	// if d.AuthEnabled {
	// 	// Ignore any errors.
	// 	d.Profile = profileFromSession(r)
	// }

	if err := tmpl.t.Execute(w, nil); err != nil {
		return appErrorf(err, "could not write template: %v", err)
	}
	return nil
}
