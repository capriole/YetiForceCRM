<?php namespace App\log;

use \App\DB;
use \yii\log\Logger;
use \yii\log\Target;
use \yii\helpers\VarDumper;

class Profiling extends Target
{

	public $db;

	/**
	 * @var string name of the DB table to store cache content. Defaults to "log".
	 */
	public $logTable = 'l_yf_profile';

	/**
	 * Initializes the DbTarget component.
	 * This method will initialize the [[db]] property to make sure it refers to a valid DB connection.
	 * @throws InvalidConfigException if [[db]] is invalid.
	 */
	public function init()
	{
		parent::init();
		$this->db = DB::getInstance();
	}

	/**
	 * Stores log messages to DB.
	 */
	public function export()
	{
		$timings = [];
		$stack = [];
		foreach ($this->messages as $i => $log) {
			list($token, $level, $category, $timestamp, $traces) = $log;
			$log[5] = $i;
			if ($level == Logger::LEVEL_PROFILE_BEGIN) {
				$stack[] = $log;
			} elseif ($level == Logger::LEVEL_PROFILE_END) {
				if (($last = array_pop($stack)) !== null && $last[0] === $token) {
					$timings[$last[5]] = [
						'info' => $last[0],
						'category' => $last[2],
						'timestamp' => $last[3],
						'trace' => $last[4],
						'level' => count($stack),
						'duration' => $timestamp - $last[3],
					];
				}
			}
		}

		$logID = (new \App\db\Query())->from($this->logTable)->max('id', $this->db);
		$logID++;
		foreach ($timings as &$message) {
			$text = $message['info'];
			if (!is_string($text)) {
				// exceptions may not be serializable if in the call stack somewhere is a Closure
				if ($text instanceof \Throwable || $text instanceof \Exception) {
					$text = (string) $text;
				} else {
					$text = VarDumper::export($text);
				}
			}
			$this->db->createCommand()->insert($this->logTable, [
				'id' => $logID,
				'info' => $text,
				'category' => $message['category'],
				'log_time' => $message['timestamp'],
				'trace' => $message['trace'],
				'level' => $message['level'],
				'duration' => $message['duration'],
			])->execute();
		}
	}
}