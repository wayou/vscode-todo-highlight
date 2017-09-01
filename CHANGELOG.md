# Change Log

## 0.5.11 - 2017-09-02
- fix style for the doc on vscode market

## 0.5.9 - 2017-08-30
- using array for include/exclude configuration, resolve #56. for backward compatability, string is also valid
- register disposable items to the context
- merge PR #58 exclude `.next` directory while searching for annotations as default
- exclude `.github` directory while searching for annotations as default

## 0.5.8 - 2017-07-19
- revert the fix for #48, the `\b` pattern cause other issues #51,#52

## 0.5.7 - 2017-07-18
- typo fix, resolve #47
- fix #48, the unwanted partial highlight

## 0.5.6 - 2017-07-17
- fix typo within the doc and minor fix for a potential bug. see #46

## 0.5.5 - 2017-06-01
- update doc. fix typo of the example configuration within the README file.
- fix a bug that the `defaultStyle` not applied to built in keywords `TODO:` and `FIXME:`

## 0.5.4 - 2017-05-31
- remove `todohighlight.highlightWholeLine` from configuration contributes.
- update doc, add reference to the official API for a full list of available styling properties, resolve #40

## 0.5.2 - 2017-05-19
- minor fix: clear highlight when keywords are been edited and no longer exists

## 0.5.1 - 2017-05-18
- minor fix: escase regexp for the keywords text property so that we can highlght `.$|\`, etc. resolve #36, resolve #37

## 0.5.0 - 2017-05-17
- support keywords configuration via RegExp by tuning the `todohighlight.keywordsPattern`. if the regexp is provided, the `todohighlight.keywords` will be ignored, resolve #28, resolve #33, resolve #36

## 0.4.16 - 2017-04-24
- there always been users report that the file path not clickable in the output channel. provide an option `todoghighlight.toggleURI` to toggle the file pattern. resolve #31

## 0.4.15 - 2017-04-08
- auto detect platform using the `os` module, thx @anupam-git for PR#26

## 0.4.14 - 2017-04-02
- clear output channel if no results, fix #24

## 0.4.10 - 2017-03-21
- show progress indicator for file searching
- add a configuration key `maxFilesForSearch` to set the max files that allowed to search, default is 5120

## 0.4.9 - 2017-03-20
- add `**/build/**` and `**/.vscode/**` into default exclude directories

## 0.4.7 - 2017-03-18
- fix #20, the file path that not clickable on Linux. provide a configuratoin to toggle the pattern of the file path, this way can ensure the file path clickable on both UNIX and Windows

## 0.4.6 - 2017-03-17
- glob pattern copied from [vscode api doc](https://code.visualstudio.com/docs/extensionAPI/vscode-api) using the `∕`(divition slash, witch is different from `/`) for path portion, this makes the exclude pattern fail to work in code. fix #14
- file pattern `<path>#<line>` seems clickable within the output channel on Mac now. remove the `<path>:<line>:<col>` form the output channel and resolve #19
- reduce the max allowed size for `findFiles` from 5120 to 999 for performance consideration

## 0.4.5 - 2017-03-02
- entire line highlighting support via configuration, resolve #16

## 0.4.4 - 2017-03-02
- seems no workaround for the links within the outputpannel to work on both mac and windows, so display the two type of links

## 0.4.3 - 2017-03-02
- just find that links in the outputchannel not clickable on Mac now, using hash and will work both on Windows and Mac now. 

## 0.4.2 - 2017-03-01
- fix #15 links in outputh channel not clickable on windows

## 0.4.1 - 2017-03-01
- list annotations into the outputchannel instead of the quickpick panel, resolve #13
- store search result into workspaceState, using the status bar item to show the result at any time

## 0.4.0 - 2017-02-23
- list annotations, resolve #7,#9
- show corresponding message in status bar, resolve #12

## 0.3.0 - 2017-01-14
- using `onDidChangeConfiguration` API to detect configuration change and make the user settings take effect
- adding command `Toggle highlight` to enable/disable the highlight
- adding a configuration section `todohighlight.isEnable` to enable/disable the highlight

## 0.2.1 - 2017-01-06
- fix #5

## 0.2.0 - 2017-01-06
- ruler color customizing support, see also #4
- make user settings take effect immediately without editor reload

## 0.1.0 - 2017-01-05
- resolve #2, customizing colors support
- resolve #3, customizing keywords support
- case sensitive config now support in settings, see also #1
- add MIT license

## 0.0.5 - 2016-12-27
- enable case-insensitive patterns , see #1

## 0.0.1 - 2016-12-22
- initial release
