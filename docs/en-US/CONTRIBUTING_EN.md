# 🎵 Moodify Contributing Guide

[简体中文](../../CONTRIBUTING.md) | English

> Thank you for your interest in the Moodify project! We warmly welcome all forms of contributions.

Moodify is an AI-powered intelligent music recommendation system. Whether you're an experienced developer or just starting to learn programming, you can make valuable contributions to this project.

## Finding Ways to Contribute

### Beginner Tasks (`good first issue`)
- Add new emotion states to the DynamicEmoji component, such as confused, excited, frustrated, calm and other emotion Canvas rendering effects, requiring learning basic Canvas API usage
- Optimize mobile responsive layout, including adjusting component display on small screen devices, ensuring appropriate button sizes, clear readable text, and touch-friendly interactions
- Improve component accessibility support by adding aria-label attributes, keyboard navigation support, screen reader compatibility to make the app usable for visually impaired users
- Add more language pack translations such as English, Japanese, Korean, French, German, etc., requiring translation of interface text and emotion vocabulary, understanding Vue i18n usage
- Fix UI detail issues including button hover effects, color matching, font sizes, spacing adjustments, icon alignment and other visual optimization work
- Write detailed usage documentation and code examples for components, helping other developers understand component props, events, slots and other APIs
- Optimize loading animation effects, implement more diverse waveform animation modes for the ProgressLoader component, providing better visual experience during user waiting
- Add more interaction states to MusicCard component, such as loading state, error state, favorite state visual feedback

### Advanced Tasks (`help wanted`)
- Deep optimization of GSAP animation library usage, reducing animation CPU and memory consumption, achieving 60fps smooth animations, handling animation conflicts and performance bottlenecks
- Implement advanced Canvas animation optimization techniques based on existing canvasRenderer.js for off-screen rendering, object pool management, requestAnimationFrame optimization
- Extend useAnimationController and useAudioPlayer composable functions, adding more complex animation control and audio processing logic
- Optimize Pinia state management, extend animations.js store functionality, handle complex application state synchronization and error recovery
- Implement user behavior-based preference learning mechanism, dynamically adjusting recommendation algorithm weights based on user history of emotion input, Spotify link clicks, etc.
- Develop advanced interactive features for MusicCard component, such as like/favorite, displaying multiple emotion ratios, supporting multiple music platform playback links
- Integrate third-party music platform APIs like NetEase Cloud Music, requiring handling OAuth2.0 authentication, token refresh, cross-origin requests and other complex logic
- Implement PWA functionality, adding Service Worker support, offline caching, push notifications and other modern web application features

### Bug Fixes
- Fix Sass deprecation warnings by replacing all `@import` syntax with new `@use` syntax in components, resolving Dart Sass 3.0.0 compatibility issues
- Resolve mixed-decls warnings by fixing declaration position issues after media queries in ResultsView.vue, avoiding future CSS behavior changes
- Fix legacy-js-api warnings by upgrading Sass configuration to use modern APIs, avoiding compatibility issues
- Resolve Vue Router component memory leak issues during route switching, cleaning up undestroyed timers, event listeners, and Canvas animation loops
- Fix MusicCard component expand animation performance issues by optimizing transform and position calculation logic
- Resolve SCSS style compatibility issues across different browsers, especially CSS Grid, Flexbox, CSS variable browser prefix handling
- Fix EmotionInput component state synchronization issues during rapid input, preventing race conditions and animation conflicts
- Resolve DynamicEmoji Canvas component memory leak issues by optimizing canvasRenderer.js resource management

### Feature Enhancements
- Develop user music mood history functionality including data persistence storage, timeline view, statistical analysis, data export and other complete feature modules
- Implement social sharing functionality allowing users to share their music moods to Weibo, WeChat, Twitter and other platforms, generating beautiful sharing cards
- Build personalized theme customization system allowing users to customize color schemes, font sizes, animation speeds and other interface parameters, saving user preferences
- Develop advanced audio control features including volume fade in/out, playback speed adjustment, audio effects processing, equalizer controls and other professional audio functions
- Implement real-time collaborative listening functionality where multiple users can synchronously listen to the same song, supporting chat interaction, emotion synchronization, playlist sharing
- Build intelligent playlist generation system automatically creating personalized playlists based on user's current emotion, time, weather and other factors
- Develop music emotion data analysis dashboard providing users with detailed listening habit analysis, emotion change trends, music preference evolution and other data insights
- Implement cross-device synchronization functionality allowing users to sync playback progress, favorite lists, personal settings and other data across different devices

## Contribution Process

### 1. Fork and Branching Strategy

```bash
# After forking the repository, add upstream repository
git remote add upstream https://github.com/original-owner/moodify.git

# Create feature branch
git checkout -b feat/add-emotion-history
```

**Branch Naming Conventions:**

Branch names should be concise and clear, containing a brief description of the feature or fix. Here are some examples:

```bash
✅ Good examples:
feat/add-emotion-history           # Add emotion history feature
fix/canvas-memory-leak            # Fix Canvas memory leak
docs/update-api-documentation     # Update API documentation
style/improve-mobile-layout       # Improve mobile layout

❌ Avoid these:
my-feature                        # Too vague
fix-bug                          # Not specific
update                           # Doesn't explain what's being updated
```

### 2. Commit Message Standards

We use project-specific commit style, starting with verbs followed by detailed descriptions:

```
Verb. Brief description, specifically explaining what changes were made

[Optional detailed description, explaining specific modification content and reasons]

[Optional Issue links]
```

**✅ Good commit message examples:**
```bash
Add. Add contributing guide, provide development environment setup and contribution process instructions
Refactor. Optimize dynamic emotion component canvas size and styles, adjust responsive design
Remove. Delete environment configuration files, update .gitignore to exclude environment variable files
Fix. Fix AI analysis generation logic in test mode, ensure correct emotion results are used and fix display content
Update. Add AI emotion analysis result display, optimize user input and AI result interaction logic, refactor related component styles
```

**Common verb prefixes:**
```bash
Add.         # Add new features, new files, new components
Update.      # Update existing features, optimize existing code
Fix.         # Fix bugs, resolve issues
Remove.      # Delete files, remove features
Refactor.    # Refactor code, optimize structure
```

**❌ Avoid these commits:**
```bash
fix bug                          # Doesn't specify what was fixed
update file                      # Too vague, no specific information
wip                             # Should not commit unfinished work
temp commit                     # Meaningless commit message
```

### 3. Pull Request Guidelines

#### PR Title
Use the same format as commit messages:
```
Add. Add real-time emotion analysis functionality
```

#### Pre-submission Checklist

Before submitting your PR, please ensure the following items are completed:

- [ ] **🎨 Code Standards**: Code passes ESLint check (`npm run lint`)
- [ ] **💅 Code Formatting**: Code has been formatted (`npm run format`)
- [ ] **🧪 Functional Testing**: Ensure new features work properly and don't break existing functionality
- [ ] **📱 Compatibility Testing**: Test on different browsers and devices (Chrome, Firefox, Safari, mobile)
- [ ] **🖥️ Console Check**: No obvious console errors or warnings
- [ ] **📝 Documentation Updates**: If you added new features or modified APIs, relevant documentation has been updated
- [ ] **🔧 Test Cases**: Add unit tests for new features, add regression tests for bug fixes
- [ ] **📊 Performance Impact**: Ensure modifications don't significantly affect application performance, especially animation and Canvas-related modifications
- [ ] **🔗 Issue Association**: Associate relevant Issue numbers in PR description

#### PR Description Examples

**✅ Good PR description:**
```markdown
Add. Add user emotion history record functionality

## Feature Description
Provide users with functionality to view historical emotion records, including:
- Local storage of emotion data (using localStorage)
- Timeline display of historical records
- Filter by date and emotion type
- Historical record data export functionality

## Technical Implementation
- Added `EmotionHistory.vue` component
- Created `useEmotionHistory` composable
- Added history record page routing
- Implemented data persistence and management

## Testing Status
- ✅ Unit tests added and passing
- ✅ Chrome/Firefox/Safari compatibility testing passed
- ✅ Mobile responsive testing passed
- ✅ Data storage and retrieval functionality testing passed

## Related Issues
Closes #156

## Screenshots
[Add feature screenshots or GIF demonstrations]
```

**❌ Avoid this type of PR:**
```markdown
Fix bug

Fixed some issues

Closes #123
```

The above examples don't require every PR to include all details, but should at least include corresponding commits, feature descriptions, testing status, and related Issue links for better understanding and code review.

#### PR Best Practices
- **Keep PRs small and focused**: One PR should only solve one clear problem or add one feature
- **Provide clear context**: Explain in detail why this change is needed and what problem it solves
- **Respond promptly to review feedback**: Actively participate in code review discussions and respond quickly to modification suggestions
- **Keep branch updated**: Regularly rebase main branch to avoid merge conflicts

## Communication and Feedback

Good communication is key to successful collaboration during development. We provide multiple communication channels and welcome all types of feedback and suggestions.

### Communication Channels

- **🐛 Issues**: Bug reports, feature requests, technical discussions
- **💬 Discussions**: General discussions, experience sharing, question consultation
- **📋 Pull Request Reviews**: Code review and implementation discussions
- **📧 Email**: Sensitive issues or private consultation

### Issue Submission Guidelines

Issues are an important way to participate in the project. Quality Issues help us quickly understand and solve problems.

#### Bug Reports

**✅ Excellent bug report example:**
```markdown
Title: [Bug] Canvas animation stuttering during emotion input causing browser crash

**Problem Description**
When rapidly inputting multiple emotion words consecutively, the DynamicEmoji component's Canvas animation experiences severe stuttering, ultimately causing Firefox browser tab crash.

**Environment Information**
- Operating System: Windows 11 (22H2)
- Browser: Firefox 119.0.1
- Node.js: v18.17.0
- Project Version: v1.2.3

**Reproduction Steps**
1. Open application homepage
2. Quickly input "happy" in emotion input box
3. Immediately delete and input "sad"
4. Repeat steps 2-3 about 10 times
5. Observe Canvas area stuttering
6. Continue operations for about 30 seconds until browser tab crashes

**Expected Behavior**
Canvas animation should switch smoothly without causing performance issues or browser crashes

**Actual Behavior**
- Canvas animation frame rate significantly drops
- Browser memory usage continuously increases
- Eventually causes tab crash

**Additional Information**
- Similar issues occur in Chrome and Safari but don't crash
- Developer tools show memory usage growing from 50MB to 500MB+
- Console shows multiple "requestAnimationFrame callback" errors
```

**❌ Poor bug report example:**
```markdown
Title: Animation has issues

Page animation is stuck, please fix.
Browser: Firefox
```

#### Feature Requests

**✅ Excellent feature request example:**
```markdown
Title: [Feature] Add music playback history and personalized recommendation learning

**Feature Description**
Hope to add user music playback history functionality and improve personalized recommendation algorithm based on historical data.

**Problem/Need Background**
Current recommendation system only considers current emotion state, doesn't account for user's long-term music preferences. User feedback hopes system can "remember" their music taste and provide more accurate recommendations.

**Detailed Requirements**
1. Playback History
   - Record played songs, duration, skip time points
   - Record emotion state labels during playback
   - Provide history viewing interface

2. Preference Learning Algorithm
   - Analyze user music preference patterns under different emotions
   - Learn music features users like/skip
   - Judge user preference based on playback completion rate

**Use Cases**
- Users often listen to classical music in "relaxed" state, system should prioritize classical recommendations
- Long-term users want to view their music taste evolution trends

**Technical Implementation Suggestions (Optional)**
- Use IndexedDB to store playback history
- Implement machine learning algorithms to analyze user preferences
- Consider privacy protection, provide data clearing options

**Priority**: Medium
```

**❌ Poor feature request example:**
```markdown
Title: Add history feature

Can you add history records?
```

## Code Quality Suggestions

To maintain project stability, we very much hope to get your help in ensuring code quality.

### Existing Tool Support

The project currently has the following tools configured to help maintain code quality:

#### ESLint Code Checking
```bash
npm run lint    # Check code standards and auto-fix
```

If you're willing, you can run this before committing to help find potential code issues.

#### Prettier Code Formatting
```bash
npm run format  # Format code in src/ directory
```

This tool helps maintain consistent code style, you can use it if convenient.

### Testing Suggestions

Since the project currently doesn't have automated testing configured (this is our shortcoming), we would be very grateful if you could help with some manual testing:

#### Basic Functionality Verification
- Whether new features work as expected
- Whether existing functionality is affected
- Whether it displays normally in your commonly used browsers

#### If possible, we also hope you could test
- Mobile display effects (if you have devices)
- Canvas animation effects for different emotion inputs
- Whether there are obvious console errors

### Our Plans

We're considering adding the following testing tools. If you have experience or interest, we very much welcome your suggestions or help:

- Unit testing framework (possibly Vitest)
- E2E testing tools (possibly Cypress)
- Automated performance monitoring

### Completely Fine Situations

If you're not convenient for testing, or unfamiliar with certain tools, that's completely fine! We'll do our best to help verify your contributions. The most important thing is your willingness to participate in the project.


## Code of Conduct

### Inclusive Community

We are committed to creating an inclusive, friendly, and diverse open source community. Contributors of all backgrounds are welcome to participate.

#### Behaviors we encourage:
- **Respect different viewpoints**: Listen carefully and consider different technical solutions and opinions
- **Constructive feedback**: Provide specific, actionable improvement suggestions
- **Patient guidance**: Help newcomers understand project structure and development processes
- **Collaborative spirit**: Prioritize overall project benefits over personal preferences
- **Continuous learning**: Maintain an open mindset and learn from others' contributions

#### Unacceptable behaviors:
- Personal attacks, insults, or discriminatory language
- Harassment, intimidation, or threatening behavior
- Publishing others' private information
- Intentionally damaging the project or malicious submissions
- Inappropriate commercial promotion or spam

If you think the contribution guide content is unreasonable, overly complex, or doesn't match reality, please feel free to raise an Issue on GitHub or contact developers with improvement suggestions. I'm a newcomer developer and not familiar with all development processes and standards, so there might be situations where things are overcomplicated or content is too lengthy. I'll try my best to improve and optimize these contents to better serve the community.

### Conflict Resolution

When disagreements arise, we encourage:

1. **Open dialogue**: Discuss openly in relevant Issues or PRs
2. **Technology-oriented**: Make decisions based on technical merits and project goals
3. **Seek third-party opinions**: Invite other contributors or maintainers to join discussions
4. **Compromise and middle ground**: Find solutions both parties can accept

---

Thank you for your contribution! Let's build a better music recommendation experience together. If you have any questions, please feel free to communicate with us through GitHub Issues or Discussions.

> 💡 **Tip**: Check our [development documentation](../development.md) and [deployment guide](../deployment.md) for more technical details.
