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

  # sets instance variables `@compare`, `@project`, `@base_sha`, and `@straight` based
  # on input parameters.
  # 
  # @param compare [String] object to be compared with the project's current state,
  # which is stored in the `@project` attribute.
  # 
  # @param project [`Project`.] Git repository being analyzed for code changes.
  # 
  # 		- `@project`: The project object contains information about a software development
  # project, including its name and a reference to its repository.
  # 		- `name`: A string attribute representing the name of the project.
  # 		- `repository`: A reference to a `Repository` object representing the central
  # location for the project's codebase.
  # 
  # 
  # @param base_sha [Symbol] initial base commit SHA for the project when the compare
  # method is called, providing a reference point for tracking changes made to the project.
  # 
  # @param straight [Symbol] whether to use the original project commit hash or a base
  # commit hash as the reference for comparison.
  # 
  # @returns [Class] an instance of the `Comparison` class, initialized with the given
  # parameters.
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

  
  # combines project and compare instance variables with the hash value of the `diff_refs`
  # variable to generate a cache key for storing or retrieving data.
  # 
  # @returns [Hash] a hash representing the project ID and comparison criteria for
  # efficient caching.
  def cache_key
    [@project, :compare, diff_refs.hash]
  end

  # generates high-quality documentation for code by returning a `CcommitCollection`
  # object containing decorated commits based on the input `Commits` collection and
  # project information.
  # 
  # @returns [`CommitCollection`.] a `CommitCollection` object containing the decorated
  # commits for the specified project.
  # 
  # 		- `@commits`: A nested array containing the commits, each with its own set of
  # attributes, including the commit hash, author, and messages.
  # 		- `DecoratedCommits`: An array of `DecoratedCommit` objects, which contain
  # additional information about each commit, such as the repository name and the
  # commit date.
  # 		- `Project`: A reference to the project object, which contains metadata about
  # the project, including its name and path.
  def commits
    @commits ||= begin
      decorated_commits = Commit.decorate(@compare.commits, project)
      CommitCollection.new(project, decorated_commits)
    end
  end

  # creates a new `Commit` object based on the given `commit` value, which is either
  # the base commit or a new commit created with the provided `project`.
  # 
  # @returns [Object] a `Commit` object representing the initial commit of the project."
  def start_commit
    strong_memoize(:start_commit) do
      commit = @compare.base

      ::Commit.new(commit, project) if commit
    end
  end

  # retrieves and memoizes the current head commit of a Git repository using the
  # `@compare` object. If the commit is not already known, it creates a new `Commit`
  # object representing the head commit and returns it.
  # 
  # @returns [`::Commit`.] a `Commit` object representing the current head of the repository.
  # 
  # 		- `commit`: A `Commit` object representing the current head commit of the repository.
  # 		- `@compare`: An instance variable representing the `Commit` object comparing
  # the current head commit to a specified reference.
  # 		- `project`: The project associated with the repository.
  def head_commit
    strong_memoize(:head_commit) do
      commit = @compare.head

      ::Commit.new(commit, project) if commit
    end
  end
  alias_method :commit, :head_commit

  # evaluates to the SHA of the current commit.
  # 
  # @returns [Object] the SHA of the starting commit.
  def start_commit_sha
    start_commit&.sha
  end

  # retrieves the base commit SHA for a Git repository given the start and head commits,
  # computing it only if necessary to avoid redundant work.
  # 
  # @returns [String] the SHA of the base commit for the given `start_commit` and `head_commit`.
  def base_commit_sha
    strong_memoize(:base_commit) do
      next unless start_commit && head_commit

      @base_sha || project.merge_base_commit(start_commit.id, head_commit.id)&.sha
    end
  end

  # retrieves the current commit SHA of the Git repository.
  # 
  # @returns [String] the current commit SHA of the Git repository.
  def head_commit_sha
    commit&.sha
  end

  # performs a diff operation on input arguments and returns the result.
  # 
  # @returns [Object] an array of differences between the input arrays."
  def raw_diffs(...)
    @compare.diffs(...)
  end

  # creates a `Gitlab::Diff::FileCollection::Compare` object to compare files between
  # two states, providing project, diff options, and diff refs as input.
  # 
  # @param diff_options [`Gitlab::Diff::FileCollection::Compare`.] configuration options
  # for the GitLab Diff API call, which can include settings such as the type of diff
  # to generate (e.g., line-by-line or side-by-side), the branch or commit to compare,
  # and the desired level of granularity.
  # 
  # 		- `project`: The project object representing the repository where the files to
  # be diffed exist.
  # 		- `diff_options`: An optional hash containing various configuration options for
  # the diff algorithm, such as `include_stats`, `only`, `max_diffs`, and `path`.
  # 
  # 
  # @returns [Class] a `Gitlab::Diff::FileCollection` object, which represents the
  # differences between two versions of a codebase.
  def diffs(diff_options = nil)
    Gitlab::Diff::FileCollection::Compare.new(self,
      project: project,
      diff_options: diff_options,
      diff_refs: diff_refs)
  end

  # creates a new instance of `Gitlab::Diff::DiffRefs`, which is used to compute the
  # difference between two commits based on their SHA values.
  # 
  # @returns [Object] a `Gitlab::Diff::DiffRefs` object representing the differences
  # between the base and start commits and the head commit.
  def diff_refs
    Gitlab::Diff::DiffRefs.new(
      base_sha: @straight ? start_commit_sha : base_commit_sha,
      start_sha: start_commit_sha,
      head_sha: head_commit_sha
    )
  end

  # retrieves and stores all new or modified file paths from a list of difference files.
  # 
  # @returns [String] an array of tuples containing the old and new path of each file
  # that has been modified.
  def modified_paths
    paths = Set.new
    diffs.diff_files.each do |diff|
      paths.add diff.old_path
      paths.add diff.new_path
    end
    paths.to_a
  end
end
