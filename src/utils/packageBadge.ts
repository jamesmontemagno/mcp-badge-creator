import type { BadgeTheme } from '../types/badgeTheme'

export type PackageManager = 'npm' | 'nuget' | 'pypi' | 'maven' | 'rubygems' | 'crates';

export interface PackageParseResult {
  manager: PackageManager | null;
  packageId: string | null; // For simple packages
  groupId?: string; // For Maven
  artifactId?: string; // For Maven
  displayName: string; // User-friendly display
  source: 'url' | 'direct';
  error?: string;
  message?: string;
}

export interface BadgeSet {
  version: {
    markdown: string;
    imageUrl: string;
  };
  versionPrerelease?: {
    markdown: string;
    imageUrl: string;
  };
  downloads?: {
    markdown: string;
    imageUrl: string;
  };
  downloadsMonthly?: {
    markdown: string;
    imageUrl: string;
  };
  downloadsRecent?: {
    markdown: string;
    imageUrl: string;
  };
  packageUrl: string; // Link to package page
}

const urlPatterns = [
  {
    manager: 'npm' as PackageManager,
    regex: /npmjs\.com\/package\/(@?[^/]+(?:\/[^/]+)?)/,
    extract: (match: RegExpMatchArray) => ({ packageId: match[1] })
  },
  {
    manager: 'nuget' as PackageManager,
    regex: /nuget\.org\/packages\/([^/]+)/,
    extract: (match: RegExpMatchArray) => ({ packageId: match[1] })
  },
  {
    manager: 'pypi' as PackageManager,
    regex: /pypi\.org\/project\/([^/]+)/,
    extract: (match: RegExpMatchArray) => ({ packageId: match[1] })
  },
  {
    manager: 'maven' as PackageManager,
    regex: /central\.sonatype\.com\/artifact\/([^/]+)\/([^/]+)/,
    extract: (match: RegExpMatchArray) => ({ groupId: match[1], artifactId: match[2] })
  },
  {
    manager: 'rubygems' as PackageManager,
    regex: /rubygems\.org\/gems\/([^/]+)/,
    extract: (match: RegExpMatchArray) => ({ packageId: match[1] })
  },
  {
    manager: 'crates' as PackageManager,
    regex: /crates\.io\/crates\/([^/]+)/,
    extract: (match: RegExpMatchArray) => ({ packageId: match[1] })
  }
];

/**
 * Parse package input from URL or package identifier
 * Supports Maven coordinate format (groupId:artifactId)
 */
export function parsePackageInput(value: string): PackageParseResult {
  const trimmedValue = value.trim();
  
  if (!trimmedValue) {
    return {
      manager: null,
      packageId: null,
      displayName: '',
      source: 'direct',
      error: 'Please enter a package URL or name'
    };
  }

  // Try URL detection first
  for (const pattern of urlPatterns) {
    const match = trimmedValue.match(pattern.regex);
    if (match) {
      const extracted = pattern.extract(match);
      
      if (pattern.manager === 'maven') {
        const mavenData = extracted as { groupId: string; artifactId: string };
        return {
          manager: 'maven',
          packageId: null,
          groupId: mavenData.groupId,
          artifactId: mavenData.artifactId,
          displayName: `${mavenData.groupId}:${mavenData.artifactId}`,
          source: 'url',
          message: `Detected Maven package from URL`
        };
      }
      
      const pkgData = extracted as { packageId: string };
      return {
        manager: pattern.manager,
        packageId: pkgData.packageId,
        displayName: pkgData.packageId,
        source: 'url',
        message: `Detected ${pattern.manager.toUpperCase()} package from URL`
      };
    }
  }

  // Check for Maven coordinate format (groupId:artifactId)
  const mavenCoordMatch = trimmedValue.match(/^([a-zA-Z0-9.-]+):([a-zA-Z0-9._-]+)$/);
  if (mavenCoordMatch) {
    return {
      manager: 'maven',
      packageId: null,
      groupId: mavenCoordMatch[1],
      artifactId: mavenCoordMatch[2],
      displayName: trimmedValue,
      source: 'direct',
      message: 'Detected Maven coordinate format'
    };
  }

  // Direct package name input
  return {
    manager: null,
    packageId: trimmedValue,
    displayName: trimmedValue,
    source: 'direct',
    message: 'Package name detected - please select a package manager'
  };
}

/**
 * Generate badges for a package
 */
export function generatePackageBadges(
  manager: PackageManager,
  packageId: string | null,
  groupId?: string,
  artifactId?: string,
  theme?: BadgeTheme
): BadgeSet | null {
  const style = theme?.style || 'flat-square';

  switch (manager) {
    case 'npm': {
      if (!packageId) return null;
      const versionUrl = `https://img.shields.io/npm/v/${packageId}?style=${style}&logo=npm`;
      const downloadsUrl = `https://img.shields.io/npm/dt/${packageId}?style=${style}&logo=npm&label=downloads`;
      const monthlyUrl = `https://img.shields.io/npm/dm/${packageId}?style=${style}&logo=npm&label=downloads/month`;
      
      return {
        version: {
          markdown: `[![npm version](${versionUrl})](https://www.npmjs.com/package/${packageId})`,
          imageUrl: versionUrl
        },
        downloads: {
          markdown: `[![npm downloads](${downloadsUrl})](https://www.npmjs.com/package/${packageId})`,
          imageUrl: downloadsUrl
        },
        downloadsMonthly: {
          markdown: `[![npm downloads/month](${monthlyUrl})](https://www.npmjs.com/package/${packageId})`,
          imageUrl: monthlyUrl
        },
        packageUrl: `https://www.npmjs.com/package/${packageId}`
      };
    }

    case 'nuget': {
      if (!packageId) return null;
      const versionUrl = `https://img.shields.io/nuget/v/${packageId}?style=${style}&logo=nuget`;
      const prereleaseUrl = `https://img.shields.io/nuget/vpre/${packageId}?style=${style}&logo=nuget&label=prerelease`;
      const downloadsUrl = `https://img.shields.io/nuget/dt/${packageId}?style=${style}&logo=nuget&label=downloads`;
      
      return {
        version: {
          markdown: `[![NuGet version](${versionUrl})](https://www.nuget.org/packages/${packageId})`,
          imageUrl: versionUrl
        },
        versionPrerelease: {
          markdown: `[![NuGet prerelease](${prereleaseUrl})](https://www.nuget.org/packages/${packageId})`,
          imageUrl: prereleaseUrl
        },
        downloads: {
          markdown: `[![NuGet downloads](${downloadsUrl})](https://www.nuget.org/packages/${packageId})`,
          imageUrl: downloadsUrl
        },
        packageUrl: `https://www.nuget.org/packages/${packageId}`
      };
    }

    case 'pypi': {
      if (!packageId) return null;
      const versionUrl = `https://img.shields.io/pypi/v/${packageId}?style=${style}&logo=pypi`;
      const monthlyUrl = `https://img.shields.io/pypi/dm/${packageId}?style=${style}&logo=pypi&label=downloads/month`;
      
      return {
        version: {
          markdown: `[![PyPI version](${versionUrl})](https://pypi.org/project/${packageId}/)`,
          imageUrl: versionUrl
        },
        downloadsMonthly: {
          markdown: `[![PyPI downloads/month](${monthlyUrl})](https://pypi.org/project/${packageId}/)`,
          imageUrl: monthlyUrl
        },
        packageUrl: `https://pypi.org/project/${packageId}/`
      };
    }

    case 'maven': {
      if (!groupId || !artifactId) return null;
      const versionUrl = `https://img.shields.io/maven-central/v/${groupId}/${artifactId}?style=${style}&logo=apache-maven`;
      
      return {
        version: {
          markdown: `[![Maven Central](${versionUrl})](https://central.sonatype.com/artifact/${groupId}/${artifactId})`,
          imageUrl: versionUrl
        },
        packageUrl: `https://central.sonatype.com/artifact/${groupId}/${artifactId}`
      };
    }

    case 'rubygems': {
      if (!packageId) return null;
      const versionUrl = `https://img.shields.io/gem/v/${packageId}?style=${style}&logo=rubygems`;
      const downloadsUrl = `https://img.shields.io/gem/dt/${packageId}?style=${style}&logo=rubygems&label=downloads`;
      const monthlyUrl = `https://img.shields.io/gem/dm/${packageId}?style=${style}&logo=rubygems&label=downloads/month`;
      
      return {
        version: {
          markdown: `[![Gem version](${versionUrl})](https://rubygems.org/gems/${packageId})`,
          imageUrl: versionUrl
        },
        downloads: {
          markdown: `[![Gem downloads](${downloadsUrl})](https://rubygems.org/gems/${packageId})`,
          imageUrl: downloadsUrl
        },
        downloadsMonthly: {
          markdown: `[![Gem downloads/month](${monthlyUrl})](https://rubygems.org/gems/${packageId})`,
          imageUrl: monthlyUrl
        },
        packageUrl: `https://rubygems.org/gems/${packageId}`
      };
    }

    case 'crates': {
      if (!packageId) return null;
      const versionUrl = `https://img.shields.io/crates/v/${packageId}?style=${style}&logo=rust`;
      const downloadsUrl = `https://img.shields.io/crates/d/${packageId}?style=${style}&logo=rust&label=downloads`;
      const recentUrl = `https://img.shields.io/crates/dr/${packageId}?style=${style}&logo=rust&label=recent%20downloads`;
      
      return {
        version: {
          markdown: `[![Crates.io version](${versionUrl})](https://crates.io/crates/${packageId})`,
          imageUrl: versionUrl
        },
        downloads: {
          markdown: `[![Crates.io downloads](${downloadsUrl})](https://crates.io/crates/${packageId})`,
          imageUrl: downloadsUrl
        },
        downloadsRecent: {
          markdown: `[![Crates.io recent downloads](${recentUrl})](https://crates.io/crates/${packageId})`,
          imageUrl: recentUrl
        },
        packageUrl: `https://crates.io/crates/${packageId}`
      };
    }

    default:
      return null;
  }
}

/**
 * Get installation commands for a package manager
 */
export function getInstallCommands(
  manager: PackageManager,
  packageId: string | null,
  groupId?: string,
  artifactId?: string
): string[] {
  switch (manager) {
    case 'npm':
      return packageId ? [
        `npm install ${packageId}`,
        `yarn add ${packageId}`,
        `pnpm add ${packageId}`
      ] : [];

    case 'nuget':
      return packageId ? [
        `# .NET CLI\ndotnet add package ${packageId}`,
        `# Package Manager\nInstall-Package ${packageId}`,
        `# PackageReference\n<PackageReference Include="${packageId}" Version="*" />`,
        `# Paket CLI\npaket add ${packageId}`,
        `# Script & Interactive\n#r "nuget: ${packageId}, *"`
      ] : [];

    case 'pypi':
      return packageId ? [
        `pip install ${packageId}`,
        `pipx install ${packageId}`,
        `uv pip install ${packageId}`
      ] : [];

    case 'maven':
      if (!groupId || !artifactId) return [];
      return [
        `<!-- Maven pom.xml -->\n<dependency>\n    <groupId>${groupId}</groupId>\n    <artifactId>${artifactId}</artifactId>\n    <version>{version}</version>\n</dependency>`,
        `// Gradle build.gradle\nimplementation '${groupId}:${artifactId}:{version}'`
      ];

    case 'rubygems':
      return packageId ? [
        `gem install ${packageId}`,
        `# In Gemfile\ngem '${packageId}', '~> {version}'`
      ] : [];

    case 'crates':
      return packageId ? [
        `cargo add ${packageId}`,
        `# In Cargo.toml\n[dependencies]\n${packageId} = "{version}"`
      ] : [];

    default:
      return [];
  }
}
