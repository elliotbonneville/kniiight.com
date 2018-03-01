<!doctype html>

<html lang="en">
	<head>
		<meta charset="utf-8">

		<title>kniiight labs</title>
		<meta name="description" content="Hey, Javascript | Labs">
		<meta name="author" content="SitePoint">
		
		<link href='http://fonts.googleapis.com/css?family=Muli:300,400,400italic' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="css/styles.css?v=1.0">

		<!--[if lt IE 9]>
		<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<style>
			html, body {
				background: gray;
				color: white;
				font-family: "Muli", sans-serif;
				height: 100%;
			}
			
			h1 {
				text-align: center;
				font-size: 60pt;
				margin-bottom: -5px;
			}
			
			.inset-text {
				color: rgba(255, 255, 255, 0.8);
    			text-shadow: 1px 4px 6px gray, 0 0 0 #000, 1px 4px 6px gray;
			}
			
			::-moz-selection { background: #5af; color: #fff; text-shadow: none; }
			::selection { background: #5af; color: #fff; text-shadow: none; }
			
			p {
				text-align: center;
				color: #444;
			}
			
			a {
				color: #444;
			}
			
			a:visited {
				color: #333;
			}
			
			#projects_list {
				width: 100%;
			}
			
			li {
				margin-bottom: 10px;
			}
			
			body > #content {
				width: 60%;
				height: auto !important;
				min-height: 100%;
				margin: 0 auto;
				padding-bottom: 3em;
			}
			
			#footer {
				clear: both;
				position: relative;
				z-index: 10;
				height: 3em;
				margin-top: -3em;
				text-align: center;
				font-size: 10pt;
				color: #333;
			}
			
		</style>
	</head>

	<body>
		<div id="header">
			<h1 class="inset-text">kniiight labs</h1>
			<p>Thanks for stopping by. Check out some of my projects below, or have a look at my <a href="http://heyjavascript.com">JavaScript blog</a>.</p>
		</div>
		
		<br>
		
		<div id="content">
			<ul id="projects_list">
			<?php
				// get list of directories in public_html
				$path = dirname(__FILE__);;
				$dirs = scandir($path);
				foreach($dirs as $dir) {
					if($dir === "." or $dir === "..") continue;
					
					if (is_dir($path . '/' . $dir)) {
						// get file name from about.txt inside each directory
						$about = file($path."/".$dir."/about.txt");
						
						if($about[0] === null) continue;
						
						$name = rtrim($about[0]);
						$desc = rtrim($about[1]);
						
				        print '	<li>
				        			<a href="/'.$dir.'" class="project">'.$name.'</a><br>
				        			<div class="project_info">'.$desc.'</div>
				        		</li>';
				    }
				}
			?>
			</ul>
		</div>
		
		<div id="footer">
			Copyright (c) 2014, Elliot Bonneville.
		</div>

		<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-49980339-1', 'kniiight.com');
	  ga('send', 'pageview');

		</script>
	</body>
</html>