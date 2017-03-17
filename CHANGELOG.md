# Change Log

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
- caseenable case-insensitive patterns , see [PR#1](https://github.com/wayou/vscode-todo-highlight/pull/1)

## 0.0.1 - 2016-12-22
- initial release