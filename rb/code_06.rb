# frozen_string_literal: true

require 'set' # rubocop:disable Lint/RedundantRequireStatement -- Ruby 3.1 and earlier needs this. Drop this line after Ruby 3.2+ is only supported.

class Compare
  include Gitlab::Utils::StrongMemoize
  include ActsAsPaginatedDiff

  delegate :same, :head, :base, :generated_files, to: :@compare

  attr_reader :project

  def self.decorate(compare, project)
    if compare.is_a?(Compare)
      compare
    else
      self.new(compare, project)
    end
  end

  # sets instance variables `compare`, `project`, `base_sha`, and `straight`.
  # 
  # @param compare [Object] comparison object that contains the information required
  # to compare files and determine whether they have changed.
  # 
  # @param project [`Project`.] project being analyzed for compatibility checking in
  # the `initialize` method of the code snippet provided.
  # 
  # 		- `@project`: The project object contains information about the project, including
  # its name and path.
  # 		- `@base_sha`: The base SHA of the project, which can be used for comparing
  # changes in subsequent updates.
  # 		- `@straight`: A boolean flag indicating whether the update should be performed
  # directly or not.
  # 
  # 
  # @param base_sha [Symbol] base commit hash of the project when it was created, which
  # is used to compare with the latest commit hash to determine if changes have been
  # made since the project was initialized.
  # 
  # @param straight [Symbol] whether the initialization should proceed directly to the
  # `project` or if additional setup is needed before doing so.
  # 
  # @returns [instance of `Project`.] an instance of the `Comparison` class with the
  # specified parameters.
  # 
  # 		- `@compare`: The compare parameter is an instance of the `Compare` class, which
  # represents the comparison object used to determine whether the project has changed
  # since the last scan.
  # 		- `@project`: The project parameter is an instance of the `Project` class, which
  # contains information about the project being scanned.
  # 		- `@base_sha`: The base_sha parameter is a string representing the commit hash
  # of the base commit for the project, which is used to determine if the project has
  # changed.
  # 		- `@straight`: The straight parameter is a boolean value indicating whether the
  # compare operation should be performed directly without any additional filtering
  # or transformation.
  def initialize(compare, project, base_sha: nil, straight: false)
    @compare = compare
    @project = project
    @base_sha = base_sha
    @straight = straight
  end

  # Return a Hash of parameters for passing to a URL helper
  #
  # See `namespace_project_compare_url`
  def to_param
    {
      from: @straight ? start_commit_sha : (base_commit_sha || start_commit_sha),
      to: head_commit_sha
    }
  end

  # generates a unique key for caching purposes by combining project name, compare
  # mode, and reference differences using a custom hash algorithm.
  # 
  # @returns [Hash] a hash of three elements: `@project`, `:compare`, and `diff_refs`.
  def cache_key
    [@project, :compare, diff_refs.hash]
  end

  # creates a collection of decorated commits from a given set of raw commits and a
  # project object.
  # 
  # @returns [`CommitCollection`.] a `CandidateCollection` containing decorated `Commit`
  # objects.
  # 
  # 		- `@commits`: This variable contains an instance of `Commits`, which is a subclass
  # of `Sequel::Model`.
  # 		- `decorated_commits`: This is an array of `DecoratedCommit` objects, which are
  # instances of `Class.new do |c| c.extend(Gitlab::Extensions::Commit)`. Each object
  # in this array has been decorated with additional information about the commit,
  # such as the author and committer.
  # 		- `Commits`: This is an instance of `Commits`, which represents a collection of
  # commits for a given project.
  # 		- `Project`: This variable contains the project object that was passed into the
  # function.
  def commits
    @commits ||= begin
      decorated_commits = Commit.decorate(@compare.commits, project)
      CommitCollection.new(project, decorated_commits)
    end
  end

  # creates a new `Commit` instance based on the provided `commit` value and the
  # associated `project`.
  # 
  # @returns [`::Commit`.] a `Commit` object representing the initial commit of the project.
  # 
  # 		- `commit`: The commit object itself, representing the state of the project's
  # files at the time of the commit.
  # 		- `@compare.base`: The base commit for the comparison, which is used to determine
  # the changes between the current and previous states of the project.
  def start_commit
    strong_memoize(:start_commit) do
      commit = @compare.base

      ::Commit.new(commit, project) if commit
    end
  end

  # retrieves and memoizes the current head commit for a given repository based on the
  # `@compare` instance variable. If the `commit` is not already tracked, it creates
  # a new `Commit` object representing the head commit.
  # 
  # @returns [Object] a `Commit` object representing the current head of the Git repository.
  def head_commit
    strong_memoize(:head_commit) do
      commit = @compare.head

      ::Commit.new(commit, project) if commit
    end
  end
  alias_method :commit, :head_commit

  # generates the SHA of the current commit.
  # 
  # @returns [String] the SHA of the current commit.
  def start_commit_sha
    start_commit&.sha
  end

  # calculates and caches the base commit SHA for a Git repository based on the
  # `start_commit` and `head_commit`.
  # 
  # @returns [String] the SHA of the base commit for a given Git repository.
  def base_commit_sha
    strong_memoize(:base_commit) do
      next unless start_commit && head_commit

      @base_sha || project.merge_base_commit(start_commit.id, head_commit.id)&.sha
    end
  end

  # retrieves the current commit SHA of the Git repository.
  # 
  # @returns [Hash] the SHA of the current commit.
  def head_commit_sha
    commit&.sha
  end

  # passes an argument to the `@compare.diffs` method, which computes and returns a
  # list of differences between two sequences of values.
  # 
  # @returns [instance of `Diff`.] an array of differences between the input and the
  # compare object's representation of the original code."
  # 
  # 		- The `@compare` attribute is referenced, indicating that the diffs are generated
  # using a comparison with another object.
  # 		- The `diffs` method is called on the `@compare` object, which generates the
  # actual diffs.
  # 		- No explicit mention is made of the input arguments to the `raw_diffs` function,
  # suggesting that they may be optional or variable.
  def raw_diffs(...)
    @compare.diffs(...)
  end

  # creates a new instance of `Gitlab::Diff::FileCollection::Compare` and passes the
  # current object as the first argument, followed by the project, diff options, and
  # diff refs as arguments.
  # 
  # @param diff_options [`Gitlab::Diff::FileCollection::Compare::Options`.] configuration
  # for the diff tool, allowing for customization of the diff output format and other
  # settings.
  # 
  # 		- `project`: The Project object representing the GitLab repository being analyzed.
  # 		- `diff_options`: An optional hash containing various properties to customize
  # the diff generation process. Its attributes include:
  # 		+ `:maximum_lines`: (Integer, default: 100) - The maximum number of lines to
  # display in each file's diff output.
  # 		+ `:full_diff`: (Boolean, default: false) - Whether to generate a full diff or
  # just a summary of changes.
  # 
  # 
  # @returns [instance of `Gitlab::Diff::FileCollection`.] a `Gitlab::Diff::FileCollection`
  # object containing the differences between the specified revisions.
  # 
  # 		- `project`: The project that the diff is being generated for.
  # 		- `diff_options`: An optional parameter that specifies the diff options to use
  # when generating the diff.
  # 		- `diff_refs`: An array of reference names that define which branches or tags
  # to include in the diff.
  # 
  # 	The output of the `diffs` function is an instance of `Gitlab::Diff::FileCollection`,
  # which represents a collection of files and their differences. This object has
  # several attributes, including:
  # 
  # 		- `files`: An array of `Gitlab::Diff::File` objects, each representing a file
  # in the diff.
  # 		- `total_files`: The total number of files in the diff.
  # 		- `added_files`: An array of `Gitlab::Diff::File` objects, representing files
  # that have been added to the diff.
  # 		- `deleted_files`: An array of `Gitlab::Diff::File` objects, representing files
  # that have been deleted from the diff.
  # 		- `modified_files`: An array of `Gitlab::Diff::File` objects, representing files
  # that have been modified in the diff.
  def diffs(diff_options = nil)
    Gitlab::Diff::FileCollection::Compare.new(self,
      project: project,
      diff_options: diff_options,
      diff_refs: diff_refs)
  end

  # creates a new instance of `Gitlab::Diff::DiffRefs`, using the specified base and
  # start commit shas, and the head commit sha as input.
  # 
  # @returns [instance of `Gitlab::Diff::DiffRefs`.] a `Gitlab::Diff::DiffRefs` object
  # containing information about the differences between the base and start commits
  # and the head commit.
  # 
  # 		- `base_sha`: The base commit SHA, which is either `@straight` or the value
  # passed as an argument if `@straight` is false.
  # 		- `start_sha`: The start commit SHA.
  # 		- `head_sha`: The head commit SHA.
  def diff_refs
    Gitlab::Diff::DiffRefs.new(
      base_sha: @straight ? start_commit_sha : base_commit_sha,
      start_sha: start_commit_sha,
      head_sha: head_commit_sha
    )
  end

  # 1) retrieves a set of paths from a `diffs` object's `diff_files` array and 2)
  # returns the set as an array.
  # 
  # @returns [Array] an array of path pairs, where each pair represents a file that
  # has been modified between two revisions.
  def modified_paths
    paths = Set.new
    diffs.diff_files.each do |diff|
      paths.add diff.old_path
      paths.add diff.new_path
    end
    paths.to_a
  end
end
