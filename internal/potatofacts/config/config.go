/*
 * Copyright 2022 Armory, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package config

import (
	"embed"
	"github.com/armory-io/go-commons/iam"
	"github.com/armory-io/go-commons/metadata"
	"github.com/armory-io/go-commons/metrics"
	"github.com/armory-io/go-commons/server"
	"github.com/armory-io/go-commons/tracing"
	c "github.com/armory-io/go-commons/typesafeconfig"
	"go.uber.org/zap"
)

type PotatoFactsConfiguration struct {
	Facts []string
}

type Configuration struct {
	Server      server.Configuration
	Auth        iam.Configuration
	Metrics     metrics.Configuration
	Tracing     tracing.Configuration
	PotatoFacts PotatoFactsConfiguration
}

func ConfigurationProvider(
	logger *zap.SugaredLogger,
	resources embed.FS,
	app metadata.ApplicationMetadata,
) (*Configuration, error) {
	return c.ResolveConfiguration[Configuration](logger,
		c.WithBaseConfigurationNames(app.Name),
		c.WithActiveProfiles(app.Environment),
		c.WithEmbeddedFilesystems(&resources),
	)
}
